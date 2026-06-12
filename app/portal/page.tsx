import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { isSupabaseConfigured, formatCurrency } from "@/lib/data"
import { getSiteSettings } from "@/lib/data.server"
import { createClient } from "@/lib/supabase/server"
import { VaultReveal } from "@/components/vault-reveal"
import { buttonVariants } from "@/components/ui/button"
import { signOutAction } from "@/actions/auth"
import { runAutoCancelAction } from "@/actions/auto-cancel"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User,
  ShoppingBag,
  Clock,
  Unlock,
  Lock,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  LogOut,
} from "lucide-react"

// Server data fetching
async function getCustomerPortalData() {
  try {
    await runAutoCancelAction()
  } catch (err) {
    console.error("Background auto-cancel check failed:", err)
  }

  if (!isSupabaseConfigured()) {
    // Return mock customer logs
    return {
      user: { email: "customer.mock@example.com" },
      orders: [
        {
          id: "ord-8839-a76c",
          total_price: 65.000,
          status: "Delivered",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          customer_details: { fullName: "Foulen Mock" },
          items: [{ title: "ChatGPT Plus Premium", quantity: 1, price_at_purchase: 65.000 }],
        },
        {
          id: "ord-2991-f92d",
          total_price: 23.500,
          status: "Pending Confirmation",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
          customer_details: { fullName: "Foulen Mock" },
          items: [
            { title: "Spotify Premium Individual", quantity: 1, price_at_purchase: 8.500 },
            { title: "Netflix Premium 4K", quantity: 1, price_at_purchase: 15.000 },
          ],
        },
      ],
    }
  }

  try {
    const supabase = await createClient()

    // 1. Authenticate session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    // 2. Fetch Orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, items:order_items(quantity, price_at_purchase, products(title))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching customer orders:", ordersError)
      return { user, orders: [] }
    }

    // Map database order_items to simple array structures
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

    return { user, orders: mappedOrders }
  } catch (err) {
    console.error("Critical error in getCustomerPortalData:", err)
    return null
  }
}

export default async function CustomerPortalPage() {
  const data = await getCustomerPortalData()

  // Redirect to login if unauthenticated on live Supabase
  if (!data) {
    redirect("/login")
  }

  const { user, orders } = data
  const settings = await getSiteSettings()

  // Status Badge Class Mapping
  const getStatusBadgeClass = (status: string) => {
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

  // Generate WhatsApp dynamic URL for pending order payment resumption
  const getResumptionUrl = (order: any) => {
    const itemsText = order.items
      .map((item: any) => `- ${item.title} x ${item.quantity} (${formatCurrency(item.price_at_purchase)})`)
      .join("\n")

    const message = `Bonjour, je souhaite régler le paiement de ma commande en suspens!\n\n` +
      `🆔 Commande ID: ${order.id}\n` +
      `💵 Total: ${formatCurrency(order.total_price)}\n\n` +
      `📦 Articles:\n${itemsText}\n\n` +
      `Veuillez me renvoyer les instructions de paiement. Merci!`;

    const formattedPhone = settings.whatsapp_number.replace(/[\s+]/g, "")
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl space-y-10">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-card/10 border border-border p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="size-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Customer Portal</h1>
              <p className="text-xs text-muted-foreground">Logged in as {user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
            <form action={signOutAction} className="w-full sm:w-auto">
              <button
                type="submit"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "border-border text-rose-400 hover:text-rose-300 w-full justify-center gap-2 cursor-pointer",
                })}
              >
                <LogOut className="size-3.5" /> Log Out
              </button>
            </form>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" /> Active Subscriptions & Vaults
            </h2>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {orders.filter((o) => o.status === "Delivered").length} Active Vaults
            </span>
          </div>

          {/* Unlocked Credentials vault grid */}
          <div className="grid grid-cols-1 gap-6">
            {orders.filter((o) => o.status === "Delivered").length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-border bg-card/10 backdrop-blur-sm space-y-2">
                <Lock className="size-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">No active credentials unlocked</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Once your payments are validated manually via WhatsApp, credentials will show up here.
                </p>
              </div>
            ) : (
              orders
                .filter((o) => o.status === "Delivered")
                .map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-border bg-card/40 p-6 space-y-4 backdrop-blur-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Order Vault: {order.items.map((i: any) => i.title).join(", ")}
                        </h3>
                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block">
                          ID: {order.id}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Unlock className="size-3" /> Vault Ready
                      </span>
                    </div>

                    <VaultReveal orderId={order.id} />
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Order History Log */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="size-5 text-primary" /> Order History Log
          </h2>

          {orders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-border bg-card/10 backdrop-blur-sm space-y-4">
              <ShoppingBag className="size-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-white">You haven't placed any orders yet</h3>
              <Link href="/catalog" className={buttonVariants({ size: "sm" })}>
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card/15 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                      <th className="p-4">Order ID / Date</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Total Price</th>
                      <th className="p-4">Order Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-slate-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 space-y-1">
                          <span className="font-mono text-xs font-bold text-white block truncate max-w-[120px]">
                            {order.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] sm:max-w-xs space-y-0.5">
                            {order.items.map((item: any, idx: number) => (
                              <span key={idx} className="block truncate text-slate-300">
                                {item.title} <span className="text-muted-foreground">x{item.quantity}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">{formatCurrency(order.total_price)}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                              getStatusBadgeClass(order.status)
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(order.status === "Pending Confirmation" ||
                            order.status === "Waiting for Payment") && (
                            <a
                              href={getResumptionUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({
                                variant: "outline",
                                size: "xs",
                                className: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 gap-1",
                              })}
                            >
                              <MessageSquare className="size-3" /> Pay <ExternalLink className="size-3" />
                            </a>
                          )}
                          {order.status === "Delivered" && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <Unlock className="size-3" /> Unlocked
                            </span>
                          )}
                          {order.status === "Cancelled" && (
                            <span className="text-[10px] text-rose-400 font-semibold flex items-center justify-end gap-1">
                              <ShieldAlert className="size-3" /> Cancelled
                            </span>
                          )}
                          {order.status === "Paid" || order.status === "Processing" && (
                            <span className="text-[10px] text-primary font-semibold flex items-center justify-end gap-1 animate-pulse">
                              Processing...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
