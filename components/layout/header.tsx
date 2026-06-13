import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { CartDrawer } from "@/components/layout/cart-drawer"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image src="/logo.png" alt="DigitalServices4U Logo" width={400} height={120} className="w-auto h-6 sm:h-8 object-contain" priority />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
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
