import { OrdersClient } from "./orders-client"
import { isSupabaseConfigured } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

async function getAdminOrders() {
  if (!isSupabaseConfigured()) {
    // Return mock order list for local preview
    return [
      {
        id: "ord-8839-a76c",
        total_price: 65.000,
        status: "Delivered",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        customer_details: {
          fullName: "Foulen Ben Foulen",
          email: "foulen@gmail.com",
          phone: "+216 99 123 456",
          country: "Tunisia",
          notes: "Please deliver ChatGPT Plus as fast as possible. Thank you!",
        },
        items: [{ title: "ChatGPT Plus Premium", quantity: 1, price_at_purchase: 65.000 }],
      },
      {
        id: "ord-2991-f92d",
        total_price: 23.500,
        status: "Pending Confirmation",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        customer_details: {
          fullName: "Salah Ali",
          email: "salah@gmail.com",
          phone: "+216 22 987 654",
          country: "Tunisia",
          notes: "Spotify individual account and Netflix profiles.",
        },
        items: [
          { title: "Spotify Premium Individual", quantity: 1, price_at_purchase: 8.500 },
          { title: "Netflix Premium 4K", quantity: 1, price_at_purchase: 15.000 },
        ],
      },
      {
        id: "ord-1002-d922",
        total_price: 15.000,
        status: "Waiting for Payment",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        customer_details: {
          fullName: "Mariem Ben Amor",
          email: "mariem@yahoo.fr",
          phone: "+216 55 555 555",
          country: "Tunisia",
          notes: "Netflix premium profile subscription.",
        },
        items: [{ title: "Netflix Premium 4K", quantity: 1, price_at_purchase: 15.000 }],
      },
    ]
  }

  try {
    const supabase = await createClient()

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, items:order_items(quantity, price_at_purchase, products(title))")
      .order("created_at", { ascending: false })

    if (ordersError || !orders) {
      console.warn("Supabase admin orders query failed:", ordersError)
      return []
    }

    // Map order items structure
    return orders.map((order: any) => {
      const items = (order.items || []).map((item: any) => ({
        title: item.products?.title || "Unknown Digital Subscription",
        quantity: item.quantity,
        price_at_purchase: Number(item.price_at_purchase),
      }))
      return {
        ...order,
        items,
      }
    })
  } catch (err) {
    console.error("Critical error in getAdminOrders:", err)
    return []
  }
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return <OrdersClient initialOrders={orders} />
}
