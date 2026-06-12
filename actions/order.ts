"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/data"
import { revalidatePath } from "next/cache"

export interface OrderSubmission {
  fullName: string
  email: string
  phone: string
  country: string
  notes?: string
  items: {
    id: string
    quantity: number
  }[]
}

export async function createOrderAction(submission: OrderSubmission) {
  // 1. Basic validation
  if (!submission.fullName || !submission.email || !submission.phone || !submission.country) {
    return { success: false, error: "Please fill in all required fields." }
  }

  if (!submission.items || submission.items.length === 0) {
    return { success: false, error: "Your cart is empty." }
  }

  // 2. Local fallback if Supabase is offline / unconfigured
  if (!isSupabaseConfigured()) {
    const mockOrderId = crypto.randomUUID()
    console.log("Supabase unconfigured, simulating local order creation:", mockOrderId)
    return { success: true, orderId: mockOrderId }
  }

  try {
    const supabase = await createClient()

    // Retrieve active auth session (optional guest checkout)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // 3. Verify stock and fetch official prices to calculate total securely
    const productIds = submission.items.map((item) => item.id)
    
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, stock_count")
      .in("id", productIds)

    if (productsError || !dbProducts) {
      return { success: false, error: "Failed to verify product details from database." }
    }

    // Verify stock availability
    let calculatedTotal = 0
    const orderItemsToInsert = []

    for (const cartItem of submission.items) {
      const dbProduct = dbProducts.find((p) => p.id === cartItem.id)
      
      if (!dbProduct) {
        return { success: false, error: "One or more items in your cart do not exist." }
      }

      if (dbProduct.stock_count < cartItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${dbProduct.title}. Available: ${dbProduct.stock_count}`,
        }
      }

      calculatedTotal += Number(dbProduct.price) * cartItem.quantity
      orderItemsToInsert.push({
        product_id: dbProduct.id,
        quantity: cartItem.quantity,
        price_at_purchase: dbProduct.price,
      })
    }

    // 4. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_price: calculatedTotal,
        status: "Pending Confirmation",
        customer_details: {
          fullName: submission.fullName,
          email: submission.email,
          phone: submission.phone,
          country: submission.country,
          notes: submission.notes || "",
        },
      })
      .select("id")
      .single()

    if (orderError || !order) {
      console.error("Order creation failed in DB:", orderError)
      return { success: false, error: "Failed to place order. Please try again." }
    }

    // 5. Create Order Items & Deduct Stock
    // Map order_id to order items
    const finalItems = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(finalItems)
    if (itemsError) {
      console.error("Failed to insert order items:", itemsError)
      // Delete order row to rollback
      await supabase.from("orders").delete().eq("id", order.id)
      return { success: false, error: "Failed to place order items. Please try again." }
    }

    // Deduct stock levels securely via database function (RPC) to satisfy RLS write limitations for customers/guests
    for (const item of submission.items) {
      const { error: deductError } = await supabase.rpc("deduct_product_stock", {
        product_id: item.id,
        amount: item.quantity,
      })

      if (deductError) {
        console.error(`Failed to deduct stock for product ${item.id}:`, deductError)
        return { success: false, error: "Failed to deduct product stock during checkout." }
      }
    }

    // Revalidate paths to reflect updated stock count
    revalidatePath("/catalog")
    revalidatePath(`/products/${productIds.join(",")}`)

    return { success: true, orderId: order.id }
  } catch (err) {
    console.error("Critical error in createOrderAction:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}
