import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { CartDrawer } from "@/components/layout/cart-drawer"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-[family-name:var(--font-heading)] font-bold text-xl tracking-tight">
              <span className="text-foreground group-hover:text-primary transition-colors duration-300">Digital</span>
              <span className="text-primary">Services</span>
              <span className="text-foreground/60 text-sm font-sans ml-0.5">4U</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/catalog"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-muted-foreground hover:text-foreground" })}
            >
              Catalog
            </Link>
            <Link
              href="/portal"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-muted-foreground hover:text-foreground hidden sm:inline-flex" })}
            >
              My Portal
            </Link>
            <CartDrawer />
            <Link
              href="/catalog"
              className={buttonVariants({ size: "sm", className: "font-semibold" })}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
