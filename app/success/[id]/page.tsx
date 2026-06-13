import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { isSupabaseConfigured, formatCurrency } from "@/lib/data"
import { getSiteSettings } from "@/lib/data.server"
import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, MessageSquare, ShoppingBag, ShieldCheck, ExternalLink } from "lucide-react"

interface SuccessPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

async function getOrderDetails(orderId: string, searchParams: { [key: string]: string | undefined }) {
  if (!isSupabaseConfigured()) {
    // Read dynamic details from search parameters in Mock Mode
    const fullName = searchParams.name || "Foulen Ben Foulen"
    const email = searchParams.email || "foulen@gmail.com"
    const phone = searchParams.phone || "+216 99 123 456"
    const country = searchParams.country || "Tunisia"
    const notes = searchParams.notes || ""

    let items = [
      { title: "ChatGPT Plus Premium", quantity: 1, price_at_purchase: 65.00 },
      { title: "Netflix Premium 4K (Shared Profile)", quantity: 1, price_at_purchase: 15.00 }
    ]

    if (searchParams.items) {
      try {
        const parsedItems = JSON.parse(searchParams.items)
        const { MOCK_PRODUCTS } = await import("@/lib/data")
        items = parsedItems.map((item: any) => {
          const prod = MOCK_PRODUCTS.find((p) => p.id === item.id)
          return {
            title: prod ? prod.title : "Premium Subscription",
            quantity: item.quantity,
            price_at_purchase: prod ? prod.price : 10.00
          }
        })
      } catch (err) {
        console.error("Error parsing items from searchParams:", err)
      }
    }

    const total_price = items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0)

    return {
      order: {
        id: orderId,
        total_price,
        status: "Pending Confirmation",
        customer_details: {
          fullName,
          email,
          phone,
          country,
          notes
        },
        created_at: new Date().toISOString()
      },
      items
    }
  }

  try {
    const supabase = await createClient()

    // 1. Fetch Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order in success page:", orderError)
      return null
    }

    // 2. Fetch Order Items joined with Products
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("quantity, price_at_purchase, products(title)")
      .eq("order_id", orderId)

    if (itemsError || !items) {
      console.error("Error fetching order items:", itemsError)
      return { order, items: [] }
    }

    // Map to a clean structure
    const mappedItems = items.map((item: any) => ({
      title: item.products?.title || "Unknown Digital Subscription",
      quantity: item.quantity,
      price_at_purchase: Number(item.price_at_purchase),
    }))

    return { order, items: mappedItems }
  } catch (err) {
    console.error("Critical error fetching order details:", err)
    return null
  }
}

export default async function OrderSuccessPage({ params, searchParams }: SuccessPageProps) {
  // Await async parameters in Next.js 15/16
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const data = await getOrderDetails(id, resolvedSearchParams)
  const settings = await getSiteSettings()

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle2 className="size-16 text-emerald-400 mb-4" />
          <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Your order has been submitted. We could not fetch detailed receipt statistics, but you can complete confirmation on WhatsApp directly.
          </p>
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[\s+]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ className: "gap-2" })}
          >
            <MessageSquare className="size-4" /> Contact WhatsApp
          </a>
        </main>
        <Footer />
      </div>
    )
  }

  const { order, items } = data

  // Formulate pre-filled WhatsApp message
  const itemsText = items
    .map((item) => `- ${item.title} x ${item.quantity} (${formatCurrency(item.price_at_purchase)})`)
    .join("\n")

  const whatsAppMessage = `Bonjour, je souhaite finaliser ma commande sur ${settings.site_name}!\n\n` +
    `🆔 Commande ID: ${order.id}\n` +
    `👤 Client: ${order.customer_details.fullName}\n` +
    `📞 Téléphone: ${order.customer_details.phone}\n\n` +
    `📦 Articles:\n${itemsText}\n\n` +
    `💵 Total: ${formatCurrency(order.total_price)}\n\n` +
    `Veuillez m'envoyer les instructions de paiement manuel. Merci!`;

  // Strip '+' and spaces from whatsapp number
  const formattedPhone = settings.whatsapp_number.replace(/[\s+]/g, "")
  const whatsAppUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsAppMessage)}`

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-3xl space-y-8">
        {/* Top Status */}
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-float">
            <CheckCircle2 className="size-9" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold tracking-tight">Order Placed Successfully!</h1>
            <p className="text-sm text-emerald-400/80 font-medium">Order Status: {order.status}</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your order is registered in our secure database. To complete payment and receive your digital credentials, you must send a verification message on WhatsApp.
          </p>
        </div>

        {/* WhatsApp Call To Action Block */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-heading)] font-bold text-foreground">Finalize Order on WhatsApp</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Click the button below to send your Order summary to our support hotline. We will send back transfer details (D17, RunPay, Bank Transfer, Sobflous).
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                size: "lg",
                className: "bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto font-bold gap-2 text-base px-8 h-12 shadow-lg shadow-emerald-950/20",
              })}
            >
              <MessageSquare className="size-5" /> Complete Order on WhatsApp <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        {/* Order Details Receipt */}
        <div className="rounded-2xl border border-border/50 bg-card/20 p-6 sm:p-8 space-y-6 backdrop-blur-md">
          <h3 className="text-base font-bold text-foreground border-b border-border/40 pb-3">Order Receipt Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground block">Order ID</span>
              <span className="font-mono text-foreground/80 block truncate">{order.id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Date Placed</span>
              <span className="text-foreground/80 block">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Customer Name</span>
              <span className="text-foreground/80 block">{order.customer_details.fullName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block">Phone Contact</span>
              <span className="text-foreground/80 block">{order.customer_details.phone}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="border-t border-border/40 pt-4 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Subscriptions</span>
            <div className="divide-y divide-border/30">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between text-sm first:pt-0">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block">{item.title}</span>
                    <span className="text-xs text-muted-foreground">Quantity: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-border/40 pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-foreground">Total Amount</span>
            <span className="text-2xl font-extrabold text-foreground">{formatCurrency(order.total_price)}</span>
          </div>
        </div>

        {/* Guarantees */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Warranty Replacement Guarantee
          </div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" /> Local TND payment support
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
