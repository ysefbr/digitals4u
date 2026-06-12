import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { CartDrawer } from "@/components/layout/cart-drawer"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DigitalServices<span className="text-primary">4U</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-3">
            <Link
              href="/catalog"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Catalog
            </Link>
            <CartDrawer />
            <Link
              href="/catalog"
              className={buttonVariants({ size: "sm" })}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
