import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { ShieldCheck, Calendar, Info } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        <div className="space-y-3 border-b border-border/50 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5" /> Last updated: June 12, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> 1. Agreement to Terms
            </h2>
            <p>
              By accessing and using DigitalServices4U, you agree to comply with and be bound by these Terms of Service. If you do not agree, please refrain from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="size-5 text-primary" /> 2. Manual Checkout & WhatsApp Communication
            </h2>
            <p>
              DigitalServices4U operates on a manual, trust-backed billing system custom tailored for the local Tunisian market. We do NOT collect credit card details on this website. 
            </p>
            <p>
              All orders are finalized, funded, and verified manually via our official WhatsApp business number. Placing an order on our site creates a "Pending Confirmation" order status. To finalize activation, you must follow the link redirecting to our support channel, provide payment proof (e.g. Sobflous, D17, Bank transfer), and request credentials activation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> 3. Service Access & Credentials Delivery
            </h2>
            <p>
              Upon manual confirmation of your payment on WhatsApp, our admin team updates the order status to "Delivered" and populates your credentials inside our Secure Vault. You will be able to securely reveal these details from your private customer portal.
            </p>
            <p>
              We guarantee active account access for the duration of the plan purchased. Sharing, altering profiles (for shared accounts), or attempting to modify billing info on the delivered accounts will result in immediate termination of service without recovery options.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="size-5 text-primary" /> 4. Disclaimers & Limitations of Liability
            </h2>
            <p>
              DigitalServices4U operates as an independent marketplace provider. We are not directly affiliated with Netflix, OpenAI, Midjourney, Spotify, or any other underlying services. All product names, logos, and trademarks are the property of their respective owners.
            </p>
          </section>
        </div>

        <div className="bg-card/25 rounded-2xl border border-border p-6 mt-8 space-y-2">
          <h3 className="text-base font-bold text-white">Questions about our Terms?</h3>
          <p className="text-xs text-muted-foreground">
            Contact our administration directly via WhatsApp support. We are available 7 days a week.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
