import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { buttonVariants } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import Link from "next/link"
import { MOCK_FAQS, formatCurrency } from "@/lib/data"
import { getProducts } from "@/lib/data.server"
import { Check } from "lucide-react"

export default async function Home() {
  const allProducts = await getProducts()
  // Display top 3 products as featured
  const featuredProducts = allProducts.slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center relative overflow-hidden bg-background">
        {/* Glow effect background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 opacity-25 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/40 blur-[120px]" />
          <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>

        <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Tunisia's Premium Subscription Marketplace
            </div>

            <h1 className="text-4xl sm:text-6xl font-sans font-bold tracking-tight text-white leading-none">
              Unlock Premium Services <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Instantly & Securely
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Access premium AI tools, software subscriptions, streaming accounts, and digital assets. Manual checkout with instant delivery via WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/catalog"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto font-medium" })}
              >
                Explore Catalog
              </Link>
              <Link
                href="#features"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full sm:w-auto border-border/80 bg-background/50 hover:bg-muted/50 backdrop-blur-sm",
                })}
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Subscriptions Section */}
        <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-border/50">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Featured Subscriptions</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Our most popular hand-verified accounts and active tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col h-full rounded-2xl border border-border bg-card/45 backdrop-blur-md overflow-hidden hover:border-primary/40 transition-colors group relative"
              >
                {product.badge && (
                  <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                
                <div className="p-6 flex-1 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">{product.category.name}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{product.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{product.description}</p>
                  
                  {/* Features List */}
                  <ul className="space-y-2.5 pt-2">
                    {(product.features as string[]).slice(0, 4).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="size-3.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 border-t border-border/50 bg-card/70 flex flex-col gap-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Price starting at</span>
                    <span className="text-xl font-extrabold text-white">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <Link
                    href={`/products/${product.id}`}
                    className={buttonVariants({ variant: "outline", className: "w-full justify-center" })}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-10">
            <Link
              href="/catalog"
              className={buttonVariants({ variant: "link", className: "text-primary" })}
            >
              Browse all {allProducts.length} subscriptions &rarr;
            </Link>
          </div>
        </section>

        {/* Feature Grid / Trust Section */}
        <section id="features" className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 border-t border-border/50 relative z-10 bg-card/20 backdrop-blur-sm">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Why Choose Us?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              We provide a seamless and trust-backed purchase process crafted for the local Tunisian market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-3">
              <div className="text-primary font-bold text-lg">⚡ Instant WhatsApp Delivery</div>
              <p className="text-sm text-muted-foreground">Order processing is handled manually via WhatsApp. Complete the checkout, send a message, and receive your credentials in minutes.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-3">
              <div className="text-primary font-bold text-lg">🔒 Secure Credentials Vault</div>
              <p className="text-sm text-muted-foreground">Access your account details securely through your private portal. Credentials are encrypted and can only be revealed when marked delivered.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-3">
              <div className="text-primary font-bold text-lg">🇹🇳 TND Dynamic Localization</div>
              <p className="text-sm text-muted-foreground">Prices are calibrated in Tunisian Dinar (TND). Local support, local payment methods, and premium service delivery custom-tailored for you.</p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-border/50">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Got questions about ordering, payments, or activation? We have answers.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {MOCK_FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border bg-card/30 rounded-xl px-4 py-2"
                >
                  <AccordionTrigger className="text-white font-semibold hover:text-primary transition-colors text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
