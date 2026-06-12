import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { signOutAction } from "@/actions/auth"
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/45 backdrop-blur-md flex flex-col">
        {/* Logo Banner */}
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Admin<span className="text-primary">Panel</span>
            </span>
          </Link>
          <span className="text-[10px] text-primary uppercase font-bold tracking-widest mt-1 block">
            DigitalServices4U
          </span>
        </div>

        {/* Links list */}
        <nav className="flex-1 p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-card/50 transition-colors w-full shrink-0 lg:shrink"
          >
            <LayoutDashboard className="size-4 text-primary shrink-0" />
            <span>Overview</span>
          </Link>
          
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-card/50 transition-colors w-full shrink-0 lg:shrink"
          >
            <ListOrdered className="size-4 text-primary shrink-0" />
            <span>Orders Leads</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-card/50 transition-colors w-full shrink-0 lg:shrink"
          >
            <ShoppingBag className="size-4 text-primary shrink-0" />
            <span>Products Catalog</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-card/50 transition-colors w-full shrink-0 lg:shrink"
          >
            <Settings className="size-4 text-primary shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-border/50 flex flex-col gap-2.5">
          <Link
            href="/portal"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="size-3.5" /> Customer Portal
            </span>
            <ChevronRight className="size-3" />
          </Link>

          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "border-border text-rose-400 hover:text-rose-300 w-full justify-center gap-2 cursor-pointer text-xs",
              })}
            >
              <LogOut className="size-3.5" /> Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
