import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { formatCurrency } from "@/lib/data"
import { getProductById } from "@/lib/data.server"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, Shield, Zap, Sparkles, HelpCircle } from "lucide-react"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Subscription Not Found | DigitalServices4U",
      description: "The requested subscription could not be found.",
    }
  }

  return {
    title: `${product.title} - DigitalServices4U`,
    description: `${product.description.substring(0, 150)}... Buy premium accounts in Tunisia with WhatsApp delivery.`,
    openGraph: {
      title: `${product.title} | DigitalServices4U`,
      description: product.description.substring(0, 150),
      type: "website",
    },
  }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  // Await async parameters in Next.js 15/16
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <HelpCircle className="size-16 text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Subscription Not Found</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            The subscription plan you are looking for might have been retired or removed.
          </p>
          <Link href="/catalog" className={buttonVariants({ variant: "outline" })}>
            Back to Catalog
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // Determine Stock Status
  const isOutOfStock = product.stock_count <= 0
  const isLowStock = product.stock_count > 0 && product.stock_count <= 5

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Catalog
          </Link>

          <span className="text-xs text-muted-foreground">
            Home / Catalog / <span className="text-white">{product.title}</span>
          </span>
        </div>

        {/* Dynamic Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Info Columns (Left - Occupies 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-border bg-card/15 p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                  <Sparkles className="size-3" /> {product.category.name}
                </span>
                <h1 className="text-2xl sm:text-4xl font-bold text-white">{product.title}</h1>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Subscriptions Features Checklist */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h2 className="text-lg font-bold text-white">What's included in this plan:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(product.features as string[]).map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Activation Instructions */}
            <div className="rounded-2xl border border-border bg-card/10 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">How Delivery Works:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto">1</div>
                  <h3 className="text-xs font-bold text-white">Add to Cart</h3>
                  <p className="text-[11px] text-muted-foreground">Submit checkout form with contact details.</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto">2</div>
                  <h3 className="text-xs font-bold text-white">WhatsApp Pay</h3>
                  <p className="text-[11px] text-muted-foreground">Receive details & complete manually via WhatsApp.</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-2">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto">3</div>
                  <h3 className="text-xs font-bold text-white">Access Vault</h3>
                  <p className="text-[11px] text-muted-foreground">Securely reveal credentials in customer panel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky checkout card (Right - Occupies 1 col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-card/45 p-6 space-y-6 backdrop-blur-md">
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Price (Base TND)</span>
                <div className="text-3xl font-extrabold text-white">{formatCurrency(product.price)}</div>
                <span className="text-[11px] text-muted-foreground block">
                  All taxes & instant setup services included.
                </span>
              </div>

              {/* Stock status indicator */}
              <div className="space-y-2.5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock Availability:</span>
                  {isOutOfStock ? (
                    <span className="text-rose-400 font-bold uppercase">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="text-amber-400 font-bold uppercase">Low Stock ({product.stock_count})</span>
                  ) : (
                    <span className="text-emerald-400 font-bold uppercase">In Stock ({product.stock_count})</span>
                  )}
                </div>

                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOutOfStock
                        ? "w-0"
                        : isLowStock
                        ? "bg-amber-500 w-1/4"
                        : "bg-emerald-500 w-full"
                    )}
                  />
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Shield className="size-4 text-primary shrink-0" />
                  <span>Full period replacement warranty</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Zap className="size-4 text-primary shrink-0" />
                  <span>Quick WhatsApp activation support</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <AddToCartButton
                id={product.id}
                title={product.title}
                price={product.price}
                stock_count={product.stock_count}
                categoryName={product.category.name}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
