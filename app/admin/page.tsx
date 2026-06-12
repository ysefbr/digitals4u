import { isSupabaseConfigured, formatCurrency } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ListOrdered,
  Plus,
} from "lucide-react"

async function getAdminOverviewData() {
  if (!isSupabaseConfigured()) {
    // Mock Admin Overview Details
    return {
      metrics: {
        totalOrders: 18,
        pendingRevenue: 88.500,
        completedRevenue: 485.000,
        activeProducts: 6,
      },
      recentOrders: [
        {
          id: "ord-8839-a76c",
          total_price: 65.000,
          status: "Delivered",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          customer_details: { fullName: "Foulen Ben Foulen", email: "foulen@gmail.com" },
        },
        {
          id: "ord-2991-f92d",
          total_price: 23.500,
          status: "Pending Confirmation",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          customer_details: { fullName: "Ben Foulen", email: "customer@gmail.com" },
        },
        {
          id: "ord-1002-d922",
          total_price: 15.000,
          status: "Waiting for Payment",
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          customer_details: { fullName: "Salah Ali", email: "salah@gmail.com" },
        },
      ],
    }
  }

  try {
    const supabase = await createClient()

    // 1. Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching admin orders data:", ordersError)
      return null
    }

    // 2. Fetch products count
    const { count: productsCount, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    if (productsError) {
      console.error("Error fetching products count:", productsError)
    }

    // Calculate metrics
    let pendingRevenue = 0
    let completedRevenue = 0

    orders.forEach((order) => {
      const price = Number(order.total_price)
      if (order.status === "Pending Confirmation" || order.status === "Waiting for Payment") {
        pendingRevenue += price
      } else if (order.status === "Paid" || order.status === "Processing" || order.status === "Delivered") {
        completedRevenue += price
      }
    })

    return {
      metrics: {
        totalOrders: orders.length,
        pendingRevenue,
        completedRevenue,
        activeProducts: productsCount || 0,
      },
      recentOrders: orders.slice(0, 5).map((order) => ({
        id: order.id,
        total_price: Number(order.total_price),
        status: order.status,
        created_at: order.created_at,
        customer_details: order.customer_details,
      })),
    }
  } catch (err) {
    console.error("Critical error in getAdminOverviewData:", err)
    return null
  }
}

export default async function AdminOverviewPage() {
  const data = await getAdminOverviewData()

  if (!data) {
    return (
      <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertCircle className="size-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Analytics Fetch Error</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          We couldn't connect to Supabase to compile admin logs. Please verify connection credentials in .env.local.
        </p>
      </div>
    )
  }

  const { metrics, recentOrders } = data

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending Confirmation":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Waiting for Payment":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Paid":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "Processing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Overview Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          General business metrics and order leads summary.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-2 relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered Revenue</span>
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(metrics.completedRevenue)}</div>
          <span className="text-[10px] text-muted-foreground block">Sum of paid/delivered orders</span>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-2 relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Leads Value</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(metrics.pendingRevenue)}</div>
          <span className="text-[10px] text-muted-foreground block">Awaiting WhatsApp payments</span>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-2 relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders Leads</span>
            <ListOrdered className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalOrders}</div>
          <span className="text-[10px] text-muted-foreground block">Cumulative checkout items</span>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-2 relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
            <ShoppingBag className="size-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.activeProducts}</div>
          <span className="text-[10px] text-muted-foreground block">Count of listed subscriptions</span>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="size-4.5 text-primary" /> Recent Incoming Orders
          </h2>
          <Link
            href="/admin/orders"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
          >
            Manage Orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-border bg-card/10 text-xs text-muted-foreground">
            No incoming order logs registered yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/15 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-slate-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-mono text-xs font-semibold text-white truncate max-w-[120px]">
                        {order.id}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <span className="font-bold text-slate-200 block">{order.customer_details.fullName}</span>
                        <span className="text-[10px] text-muted-foreground block">{order.customer_details.email}</span>
                      </td>
                      <td className="p-4 font-bold text-white">{formatCurrency(order.total_price)}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            getStatusClass(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-[10px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
