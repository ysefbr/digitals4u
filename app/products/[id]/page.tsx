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
import Image from "next/image"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.digitals4u.app";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Subscription Not Found",
      description: "The requested subscription could not be found.",
    }
  }

  const productUrl = `${siteUrl}/products/${product.id}`
  const description = `${product.description.substring(0, 150)}... Buy premium accounts in Tunisia with WhatsApp delivery.`

  return {
    title: product.title,
    description,
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: `${product.title} | DigitalServices4U`,
      description: product.description.substring(0, 150),
      type: "website",
      url: productUrl,
      ...(product.image && {
        images: [
          {
            url: product.image,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.substring(0, 150),
      ...(product.image && { images: [product.image] }),
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
          <HelpCircle className="size-16 text-destructive mb-4" />
          <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-foreground mb-2">Subscription Not Found</h2>
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

  // JSON-LD Structured Data — Product Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    ...(product.image && { image: product.image }),
    brand: {
      "@type": "Brand",
      name: "DigitalServices4U",
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.id}`,
      priceCurrency: "TND",
      price: product.price.toFixed(3),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "DigitalServices4U",
      },
    },
  }

  // JSON-LD Structured Data — BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catalog",
        item: `${siteUrl}/catalog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${siteUrl}/products/${product.id}`,
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* JSON-LD Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-5 sm:py-8 sm:px-6 lg:px-8 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 sm:mb-8 flex items-center justify-between">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft className="size-3.5" />
            Back to Catalog
          </Link>

          <span className="text-xs text-muted-foreground">
            Home / Catalog / <span className="text-foreground">{product.title}</span>
          </span>
        </div>

        {/* Dynamic Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
          {/* Main Info Columns (Left - Occupies 2 cols) */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-8">
            <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 p-4 sm:p-8 space-y-4 sm:space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/6 rounded-full blur-[80px] pointer-events-none" />

              {product.image && (
                <div className="relative w-full h-48 sm:h-80 rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 border border-border/40 shrink-0">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    unoptimized={product.image.toLowerCase().endsWith('.gif')}
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/15">
                  <Sparkles className="size-2.5 sm:size-3" /> {product.category.name}
                </span>
                <h1 className="text-xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold text-foreground">{product.title}</h1>
              </div>

              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Subscriptions Features Checklist */}
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border/40">
                <h2 className="text-sm sm:text-lg font-bold text-foreground">What&apos;s included in this plan:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {(product.features as string[]).map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground">
                      <Check className="size-3.5 sm:size-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Activation Instructions */}
            <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/20 p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h2 className="text-sm sm:text-lg font-bold text-foreground">How Delivery Works:</h2>
              <div className="grid grid-cols-3 md:grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-background/50 border border-border/40 space-y-1.5 sm:space-y-3 hover:border-primary/20 transition-colors duration-300">
                  <div className="size-7 sm:size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto text-xs sm:text-sm">1</div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground">Add to Cart</h3>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground">Submit checkout form with contact details.</p>
                </div>
                <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-background/50 border border-border/40 space-y-1.5 sm:space-y-3 hover:border-primary/20 transition-colors duration-300">
                  <div className="size-7 sm:size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto text-xs sm:text-sm">2</div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground">WhatsApp Pay</h3>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground">Receive details &amp; complete manually via WhatsApp.</p>
                </div>
                <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-background/50 border border-border/40 space-y-1.5 sm:space-y-3 hover:border-primary/20 transition-colors duration-300">
                  <div className="size-7 sm:size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mx-auto text-xs sm:text-sm">3</div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground">Access Vault</h3>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground">Securely reveal credentials in customer panel.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky checkout card (Right - Occupies 1 col) */}
          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24">
            <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/40 p-4 sm:p-6 space-y-4 sm:space-y-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/6 rounded-full blur-[60px] pointer-events-none" />

              <div className="space-y-1.5 sm:space-y-2 relative">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Price (Base TND)</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{formatCurrency(product.price)}</div>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground block">
                  All taxes &amp; instant setup services included.
                </span>
              </div>

              {/* Stock status indicator */}
              <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock Availability:</span>
                  {isOutOfStock ? (
                    <span className="text-destructive font-bold uppercase">Out of Stock</span>
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
              <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
                  <Shield className="size-3.5 sm:size-4 text-primary shrink-0" />
                  <span>Full period replacement warranty</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
                  <Zap className="size-3.5 sm:size-4 text-primary shrink-0" />
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
