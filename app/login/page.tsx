"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ShieldCheck, Loader2, AlertCircle, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

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
      // Save mock session locally to bypass portal server check
      localStorage.setItem("mock-session", JSON.stringify({ email, role: "admin" }))
      
      // Force reload or redirect to portal
      setTimeout(() => {
        router.push("/portal")
        router.refresh()
      }, 800)
      return
    }

    try {
      const supabase = createClient()

      if (activeTab === "login") {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          setError(loginError.message)
          setLoading(false)
        } else if (data.user) {
          // Success: query role
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single()

          if (profile?.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/portal")
          }
          router.refresh()
        }
      } else {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signupError) {
          setError(signupError.message)
          setLoading(false)
        } else if (data.user) {
          if (data.session) {
            setMessage("Account created and logged in! Redirecting...")
            router.push("/portal")
            router.refresh()
          } else {
            setMessage("Registration successful! Please check your email to confirm your account.")
            setLoading(false)
          }
        }
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
          <div className="text-center space-y-2 relative">
            <h1 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-foreground flex items-center justify-center gap-2">
              <KeyRound className="size-5 text-primary" /> Digital<span className="text-primary">Services</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in to access your digital account vault and order logs.
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-muted/40 p-1.5 rounded-xl border border-border/40">
            <button
              onClick={() => {
                setActiveTab("login")
                setError(null)
                setMessage(null)
              }}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-colors duration-200 ${
                activeTab === "login"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup")
                setError(null)
                setMessage(null)
              }}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-colors duration-200 ${
                activeTab === "signup"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert logs */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/15 text-primary text-xs flex items-start gap-3">
              <ShieldCheck className="size-4 shrink-0 mt-0.5" />
              <span>{message}</span>
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
                placeholder="e.g. customer@example.com"
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
                  <Loader2 className="size-4 animate-spin" /> Processing...
                </>
              ) : activeTab === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Bottom Trust */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground border-t border-border/40 pt-4">
            <ShieldCheck className="size-3.5 text-primary" /> Securing digital delivery vaults in Tunisia.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
