"use client"

import * as React from "react"
import { useCartStore } from "@/lib/cart"
import { formatCurrency } from "@/lib/data"
import { createOrderAction } from "@/actions/order"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { items, getCartTotal, clearCart } = useCartStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  const total = getCartTotal()

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingBag className="size-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            You cannot checkout with an empty cart. Choose a subscription first.
          </p>
          <Link href="/catalog" className={buttonVariants()}>
            Browse Catalog
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const country = formData.get("country") as string
    const notes = formData.get("notes") as string

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }

    const cartItems = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }))

    try {
      const res = await createOrderAction({
        fullName,
        email,
        phone,
        country,
        notes,
        items: cartItems,
      })

      if (res.success && res.orderId) {
        clearCart()
        
        // Pass checkout parameters in URL to support dynamic rendering in local Mock Mode
        const queryParams = new URLSearchParams({
          name: fullName,
          email,
          phone,
          country,
          notes: notes || "",
          items: JSON.stringify(cartItems)
        }).toString()

        router.push(`/success/${res.orderId}?${queryParams}`)
      } else {
        setError(res.error || "An error occurred while creating your order.")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to submit order. Please check your network connection.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-5xl">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Checkout Form (Left - Occupies 3 cols) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-6 rounded-2xl border border-border bg-card/15 p-6 sm:p-8 backdrop-blur-md"
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">Contact & Billing Info</h1>
              <p className="text-xs text-muted-foreground">
                Enter your details. Payments are completed manually via WhatsApp.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white text-xs font-semibold">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="e.g. Foulen Ben Foulen"
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. foulen@gmail.com"
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white text-xs font-semibold">
                  Phone Number (WhatsApp Active)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="e.g. +216 99 123 456"
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-white text-xs font-semibold">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  required
                  defaultValue="Tunisia"
                  placeholder="e.g. Tunisia"
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white text-xs font-semibold">
                Order Notes (Optional)
              </Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Specify private profile requirements, pin preferences, or billing questions..."
                className="w-full bg-background border border-border text-sm rounded-xl p-3 outline-none focus:border-ring focus:ring-1 focus:ring-ring text-white resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
              <ShieldCheck className="size-4.5 text-primary shrink-0" />
              <span>
                By placing this order, you agree to contact support via WhatsApp to finalize the manual payment and reveal your credentials.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonVariants({
                size: "lg",
                className: "w-full justify-center gap-2 cursor-pointer font-medium h-11 select-none",
              })}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting Order...
                </>
              ) : (
                "Place Order & Complete on WhatsApp"
              )}
            </button>
          </form>

          {/* Cart Summary (Right - Occupies 2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/45 p-6 space-y-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>

            <div className="divide-y divide-border/50 max-h-80 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between gap-4 first:pt-0">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping / Setup</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border/50">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-extrabold text-white">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
