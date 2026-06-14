"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { signOutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Settings,
  LogOut,
  FolderTree,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Orders Leads", icon: ListOrdered },
    { href: "/admin/products", label: "Products Catalog", icon: ShoppingBag },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
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
      <nav className="flex-1 p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors w-full shrink-0 lg:shrink",
                isActive
                  ? "bg-primary/10 text-primary font-medium border border-primary/15"
                  : "text-slate-300 hover:text-white hover:bg-card/50"
              )}
            >
              <item.icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer controls */}
      <div className="p-4 border-t border-border/50 flex flex-col gap-2.5">
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
  )
}
