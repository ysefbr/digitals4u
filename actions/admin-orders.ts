"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/data"
import { revalidatePath } from "next/cache"

async function verifyAdmin(supabase: any) {
  if (!isSupabaseConfigured()) return true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    return profile?.role === "admin"
  } catch (err) {
    console.error("Admin verification failed:", err)
    return false
  }
}

async function updateOrderStatusAndStock(supabase: any, orderId: string, newStatus: string) {
  // 1. Fetch current order status and items
  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select("status, items:order_items(product_id, quantity)")
    .eq("id", orderId)
    .single()

  if (orderFetchError || !order) {
    return { success: false, error: "Order not found." }
  }

  const oldStatus = order.status

  if (oldStatus === newStatus) {
    return { success: true }
  }

  // 2. Stock Restoration (if moving to Cancelled)
  if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
    const items = order.items || []
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock_count")
        .eq("id", item.product_id)
        .single()
      
      if (product) {
        const newStock = product.stock_count + item.quantity
        await supabase
          .from("products")
          .update({ stock_count: newStock })
          .eq("id", item.product_id)
      }
    }
  } 
  // 3. Stock Deduction (if moving away from Cancelled)
  else if (oldStatus === "Cancelled" && newStatus !== "Cancelled") {
    const items = order.items || []
    const updates = []
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("title, stock_count")
        .eq("id", item.product_id)
        .single()

      if (!product || product.stock_count < item.quantity) {
        return {
          success: false,
          error: `Cannot reactivate order: Insufficient stock for ${product?.title || "product"}.`,
        }
      }
      updates.push({ id: item.product_id, newStock: product.stock_count - item.quantity })
    }

    for (const u of updates) {
      await supabase
        .from("products")
        .update({ stock_count: u.newStock })
        .eq("id", u.id)
    }
  }

  // 4. Update the order status
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)

  if (error) {
    return { success: false, error: "Failed to update order status." }
  }

  return { success: true }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  if (!orderId || !status) {
    return { success: false, error: "Please provide valid order and status information." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating order status update:", orderId, status)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const res = await updateOrderStatusAndStock(supabase, orderId, status)
    if (!res.success) {
      return res
    }

    revalidatePath("/portal")
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (err) {
    console.error("updateOrderStatusAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function deliverCredentialsAction(orderId: string, credentialsText: string) {
  if (!orderId || !credentialsText) {
    return { success: false, error: "Please fill in the credentials details to deliver." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating credentials delivery:", orderId, credentialsText)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    // 1. Insert or update secure_vault
    const { error: vaultError } = await supabase
      .from("secure_vault")
      .upsert({
        order_id: orderId,
        credentials_text: credentialsText,
        is_revealed: false,
      }, { onConflict: "order_id" })

    if (vaultError) {
      console.error("Error writing credentials into vault:", vaultError)
      return { success: false, error: "Failed to write credentials into secure vault." }
    }

    // 2. Update order status to 'Delivered' using our helper
    const res = await updateOrderStatusAndStock(supabase, orderId, "Delivered")
    if (!res.success) {
      return res
    }

    revalidatePath("/portal")
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (err) {
    console.error("deliverCredentialsAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}
