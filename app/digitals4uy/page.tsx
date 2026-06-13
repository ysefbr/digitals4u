"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    // Fallback if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log("Supabase unconfigured. Simulating successful login for:", email)
      localStorage.setItem("mock-session", JSON.stringify({ email, role: "admin" }))
      
      setTimeout(() => {
        router.push("/admin")
        router.refresh()
      }, 800)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
      } else if (data.user) {
        // Always redirect to admin panel
        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected network error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        {/* Auth card */}
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8 backdrop-blur-md space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-primary/6 rounded-full blur-[70px] pointer-events-none" />

          {/* Heading */}
          <div className="text-center space-y-3 relative flex flex-col items-center justify-center">
            <Image src="/logo.png" alt="DigitalServices4U Logo" width={400} height={120} className="w-auto h-8 sm:h-10 object-contain" priority />
            <p className="text-xs text-muted-foreground mt-2">
              Admin access only. Sign in to manage your store.
            </p>
          </div>

          {/* Admin badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              <ShieldCheck className="size-3" /> Admin Panel
            </span>
          </div>

          {/* Alert logs */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
                className="bg-background border-border/50 text-sm h-10 rounded-xl focus:border-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground text-xs font-semibold">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="bg-background border-border/50 text-sm h-10 rounded-xl focus:border-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonVariants({
                className: "w-full justify-center gap-2 cursor-pointer font-semibold h-10 select-none mt-2 shadow-lg shadow-primary/15",
              })}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Authenticating...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Bottom Trust */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground border-t border-border/40 pt-4">
            <ShieldCheck className="size-3.5 text-primary" /> Restricted access — authorized administrators only.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
