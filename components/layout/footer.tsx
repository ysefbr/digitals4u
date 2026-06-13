import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      {/* Gold decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left space-y-1">
            <span className="font-[family-name:var(--font-heading)] font-bold text-lg tracking-tight">
              <span className="text-foreground">Digital</span>
              <span className="text-primary">Services</span>
              <span className="text-foreground/50 text-xs font-sans ml-0.5">4U</span>
            </span>
            <p className="text-xs text-muted-foreground">
              Tunisia&apos;s trusted digital subscription marketplace.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Catalog
            </Link>
            <Link href="/portal" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Portal
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Terms
            </Link>
            <Link href="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Refunds
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} DigitalServices4U. All rights reserved. Tunisian Dinar marketplace.
          </p>
        </div>
      </div>
    </footer>
  )
}
