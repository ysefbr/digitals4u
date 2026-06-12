import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-8 md:flex md:items-center md:justify-between sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground">
            Refund Policy
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DigitalServices4U. All rights reserved. (Tunisian Dinar Marketplace)
          </p>
        </div>
      </div>
    </footer>
  )
}
