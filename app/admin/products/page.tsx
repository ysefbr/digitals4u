import { ProductsClient } from "./products-client"
import { isSupabaseConfigured, MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

async function getAdminProducts(params: { page: number; limit: number; search?: string; category?: string }) {
  const { page, limit, search, category } = params
  const offset = (page - 1) * limit

  if (!isSupabaseConfigured()) {
    let filtered = [...MOCK_PRODUCTS]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (category) {
      filtered = filtered.filter(p => p.category_id === category || p.category.slug === category)
    }
    const totalCount = filtered.length
    const paginated = filtered.slice(offset, offset + limit)
    return { products: paginated, totalPages: Math.ceil(totalCount / limit) }
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select("*, category:categories(name, slug)", { count: "exact" })
      .order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }
    if (category) {
      query = query.eq("category_id", category)
    }

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error || !data) {
      console.warn("Supabase admin products fetch failed, using mocks:", error)
      return { products: MOCK_PRODUCTS.slice(0, limit), totalPages: 1 }
    }
    return { products: data, totalPages: count ? Math.ceil(count / limit) : 1 }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to mocks:", err)
    return { products: MOCK_PRODUCTS.slice(0, limit), totalPages: 1 }
  }
}

async function getAdminCategories() {
  if (!isSupabaseConfigured()) {
    return MOCK_CATEGORIES
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error || !data) {
      return MOCK_CATEGORIES
    }
    return data
  } catch (err) {
    return MOCK_CATEGORIES
  }
}

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const search = params.q || ""
  const category = params.category || ""
  const limit = 10

  const { products, totalPages } = await getAdminProducts({ page, limit, search, category })
  const categories = await getAdminCategories()

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      currentPage={page}
      totalPages={totalPages}
      initialSearch={search}
      initialCategory={category}
    />
  )
}
