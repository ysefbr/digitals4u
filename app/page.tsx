import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { buttonVariants } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import Link from "next/link"
import { MOCK_FAQS, formatCurrency } from "@/lib/data"
import { getProducts } from "@/lib/data.server"
import { Check, Zap, Shield, Lock } from "lucide-react"

export default async function Home() {
  const allProducts = await getProducts()
  // Display top 3 products as featured
  const featuredProducts = allProducts.slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Warm ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[15%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] animate-glow-pulse" />
          <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[40%] w-[300px] h-[300px] rounded-full bg-orange-500/4 blur-[100px]" />
        </div>

        <section className="container mx-auto px-4 py-28 sm:py-36 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Tunisia&apos;s Premium Marketplace
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-heading)] font-bold tracking-tight leading-[1.1]">
              Unlock Premium{" "}
              <br className="hidden sm:inline" />
              <span className="text-gold-gradient">
                Digital Services
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Access premium AI tools, software subscriptions, streaming accounts, and digital assets. Manual checkout with instant delivery via WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/catalog"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto font-semibold px-8 h-12 text-base shadow-lg shadow-primary/20" })}
              >
                Explore Catalog
              </Link>
              <Link
                href="#features"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full sm:w-auto border-border/60 bg-background/50 hover:bg-muted/50 backdrop-blur-sm px-8 h-12 text-base",
                })}
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Decorative gold separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Featured Subscriptions Section */}
        <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-2xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold tracking-tight">Featured Subscriptions</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Our most popular hand-verified accounts and active tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col h-full rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 relative"
              >
                {product.badge && (
                  <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                
                <div className="p-6 flex-1 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">{product.category.name}</span>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{product.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{product.description}</p>
                  
                  {/* Features List */}
                  <ul className="space-y-2.5 pt-2">
                    {(product.features as string[]).slice(0, 4).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="size-3.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 border-t border-border/40 bg-card/50 flex flex-col gap-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Price starting at</span>
                    <span className="text-xl font-extrabold text-foreground">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <Link
                    href={`/products/${product.id}`}
                    className={buttonVariants({ variant: "outline", className: "w-full justify-center border-border/50 hover:border-primary/30 hover:text-primary" })}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-12">
            <Link
              href="/catalog"
              className={buttonVariants({ variant: "link", className: "text-primary font-semibold" })}
            >
              Browse all {allProducts.length} subscriptions &rarr;
            </Link>
          </div>
        </section>

        {/* Decorative gold separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Feature Grid / Trust Section */}
        <section id="features" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-2xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold tracking-tight">Why Choose Us?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              We provide a seamless and trust-backed purchase process crafted for the local Tunisian market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 space-y-4 hover:border-primary/20 transition-colors duration-300 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Zap className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Instant WhatsApp Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Order processing is handled manually via WhatsApp. Complete the checkout, send a message, and receive your credentials in minutes.</p>
            </div>
            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 space-y-4 hover:border-primary/20 transition-colors duration-300 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Lock className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Secure Credentials Vault</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Access your account details securely through your private portal. Credentials are encrypted and can only be revealed when marked delivered.</p>
            </div>
            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 space-y-4 hover:border-primary/20 transition-colors duration-300 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Shield className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">TND Local Market</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Prices are calibrated in Tunisian Dinar (TND). Local support, local payment methods, and premium service delivery custom-tailored for you.</p>
            </div>
          </div>
        </section>

        {/* Decorative gold separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* FAQs Section */}
        <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Got questions about ordering, payments, or activation? We have answers.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {MOCK_FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border/50 bg-card/20 rounded-xl px-5 py-1 hover:border-primary/20 transition-colors duration-300"
                >
                  <AccordionTrigger className="text-foreground font-semibold hover:text-primary transition-colors text-base py-4">
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
