import { OrdersClient } from "./orders-client"
import { isSupabaseConfigured } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

async function getAdminOrders(params: { page: number; limit: number; search?: string; status?: string }) {
  const { page, limit, search, status } = params
  const offset = (page - 1) * limit

  if (!isSupabaseConfigured()) {
    // Return mock order list for local preview
    let filtered = [
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
    if (status) {
      filtered = filtered.filter(o => o.status === status)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(o =>
        o.customer_details.fullName.toLowerCase().includes(q) ||
        o.customer_details.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      )
    }
    const totalCount = filtered.length
    const paginated = filtered.slice(offset, offset + limit)
    return { orders: paginated, totalPages: Math.ceil(totalCount / limit) }
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from("orders")
      .select("*, items:order_items(quantity, price_at_purchase, products(title))", { count: "exact" })
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`id.ilike.%${search}%,customer_details->>fullName.ilike.%${search}%,customer_details->>email.ilike.%${search}%`)
    }

    const { data: orders, count, error: ordersError } = await query.range(offset, offset + limit - 1)

    if (ordersError || !orders) {
      console.warn("Supabase admin orders query failed:", ordersError)
      return { orders: [], totalPages: 1 }
    }

    // Map order items structure
    const mappedOrders = orders.map((order: any) => {
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

    return { orders: mappedOrders, totalPages: count ? Math.ceil(count / limit) : 1 }
  } catch (err) {
    console.error("Critical error in getAdminOrders:", err)
    return { orders: [], totalPages: 1 }
  }
}

interface AdminOrdersPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const search = params.q || ""
  const status = params.status || ""
  const limit = 10

  const { orders, totalPages } = await getAdminOrders({ page, limit, search, status })

  return (
    <OrdersClient
      initialOrders={orders}
      currentPage={page}
      totalPages={totalPages}
      initialSearch={search}
      initialStatus={status}
    />
  )
}
