import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { formatCurrency } from "@/lib/data"
import { getProducts, getCategories } from "@/lib/data.server"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Check, Search, SlidersHorizontal, ShieldCheck } from "lucide-react"

interface CatalogPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    maxPrice?: string
  }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Await async searchParams in Next.js 15/16
  const params = await searchParams
  const query = params.q || ""
  const categorySlug = params.category || ""
  const maxPriceVal = params.maxPrice ? parseFloat(params.maxPrice) : undefined

  // Fetch categories and products server-side
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: categorySlug || undefined,
      search: query || undefined,
      maxPrice: maxPriceVal,
    }),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Banner / Title */}
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Subscription Catalog</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Browse our curated marketplace of premium software, AI tools, and streaming accounts localized in TND.
          </p>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            {/* Search Box */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
              <form action="/catalog" method="GET" className="relative">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {maxPriceVal && <input type="hidden" name="maxPrice" value={maxPriceVal} />}
                <Input
                  name="q"
                  defaultValue={query}
                  placeholder="e.g. Netflix, ChatGPT..."
                  className="bg-card/50 border-border pl-10 pr-4 h-10 rounded-xl text-sm"
                />
                <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
              </form>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</label>
              <nav className="flex flex-wrap lg:flex-col gap-1">
                <Link
                  href={`/catalog?${new URLSearchParams({
                    ...(query && { q: query }),
                    ...(maxPriceVal && { maxPrice: maxPriceVal.toString() }),
                  })}`}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm transition-colors text-left w-auto lg:w-full",
                    !categorySlug
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  )}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog?${new URLSearchParams({
                      category: cat.slug,
                      ...(query && { q: query }),
                      ...(maxPriceVal && { maxPrice: maxPriceVal.toString() }),
                    })}`}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm transition-colors text-left w-auto lg:w-full",
                      categorySlug === cat.slug
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Price Brackets */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Bracket</label>
              <nav className="flex flex-wrap lg:flex-col gap-1">
                <Link
                  href={`/catalog?${new URLSearchParams({
                    ...(categorySlug && { category: categorySlug }),
                    ...(query && { q: query }),
                  })}`}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm transition-colors text-left w-auto lg:w-full",
                    !maxPriceVal
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  )}
                >
                  Any Price
                </Link>
                {[15, 30, 65, 100].map((price) => (
                  <Link
                    key={price}
                    href={`/catalog?${new URLSearchParams({
                      maxPrice: price.toString(),
                      ...(categorySlug && { category: categorySlug }),
                      ...(query && { q: query }),
                    })}`}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm transition-colors text-left w-auto lg:w-full",
                      maxPriceVal === price
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    )}
                  >
                    Under {formatCurrency(price)}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Catalog Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border border-dashed bg-card/10 backdrop-blur-sm">
                <SlidersHorizontal className="size-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No subscriptions found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  We couldn't find any results matching your search filters. Try resetting your query parameters.
                </p>
                <Link
                  href="/catalog"
                  className={buttonVariants({ variant: "outline", className: "mt-6 border-border" })}
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col h-full rounded-2xl border border-border bg-card/45 backdrop-blur-md overflow-hidden hover:border-primary/40 transition-colors group relative"
                  >
                    {product.badge && (
                      <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full z-10">
                        {product.badge}
                      </span>
                    )}

                    <div className="p-6 flex-1 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                          {product.category.name}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Stock Check */}
                      <div className="flex items-center gap-2 pt-2">
                        {product.stock_count > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            In Stock ({product.stock_count})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Out of Stock
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                          <ShieldCheck className="size-3" /> Guaranteed
                        </span>
                      </div>

                      {/* Snippet Features */}
                      <ul className="space-y-1.5 pt-1">
                        {(product.features as string[]).slice(0, 3).map((feat: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <Check className="size-3 text-primary shrink-0" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 border-t border-border/50 bg-card/70 flex flex-col gap-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-muted-foreground">Price</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(product.price)}</span>
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className={buttonVariants({ className: "w-full justify-center" })}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
