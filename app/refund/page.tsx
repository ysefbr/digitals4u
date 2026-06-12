import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Calendar, HelpCircle, AlertCircle, Sparkles } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        <div className="space-y-3 border-b border-border/50 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Refund Policy</h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5" /> Last updated: June 12, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> 1. Digital Service Nature
            </h2>
            <p>
              Due to the nature of digital goods and accounts, once details are populated and delivered to your portal, they are active and ready to use. Because they cannot be "returned," we enforce clear refund rules to avoid misuse.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> 2. Refunding Pending Orders
            </h2>
            <p>
              If you submit an order, send us a WhatsApp message, pay, and then change your mind **before we deliver** the credentials, you are entitled to a full refund. Simply contact our support on WhatsApp, notify us of your request, and we will return your funds (minus any transactional processor fees, if applicable).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" /> 3. Post-Delivery Warranty & Replacements
            </h2>
            <p>
              Once your credentials are placed in the Secure Vault, we guarantee access for the duration of the plan. If you encounter access problems:
            </p>
            <ul className="list-disc pl-5 space-y-2.5">
              <li>Contact our team immediately on WhatsApp with your Order ID.</li>
              <li>We will troubleshoot, reset, or replace the credentials within 12 hours.</li>
              <li>If we are unable to restore your service within 48 hours, you will receive a pro-rated refund based on the remaining days of your subscription.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="size-5 text-primary" /> 4. Non-Refundable Scenarios
            </h2>
            <p>
              Refunds will not be issued if your account is locked due to violations of our guidelines (e.g. changing shared profile PINs, trying to alter Netflix billing settings, or resell shared profiles).
            </p>
          </section>
        </div>

        <div className="bg-card/25 rounded-2xl border border-border p-6 mt-8 space-y-2">
          <h3 className="text-base font-bold text-white">Need a Refund?</h3>
          <p className="text-xs text-muted-foreground">
            Contact us directly on WhatsApp with your Order ID and payment receipt. We handle every dispute personally.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
