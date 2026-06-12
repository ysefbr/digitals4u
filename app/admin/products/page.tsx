import { ProductsClient } from "./products-client"
import { isSupabaseConfigured, MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/data"
import { createClient } from "@/lib/supabase/server"

async function getAdminProducts() {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(name, slug)")
      .order("created_at", { ascending: false })

    if (error || !data) {
      console.warn("Supabase admin products fetch failed, using mocks:", error)
      return MOCK_PRODUCTS
    }
    return data
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to mocks:", err)
    return MOCK_PRODUCTS
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

export default async function AdminProductsPage() {
  const products = await getAdminProducts()
  const categories = await getAdminCategories()

  return <ProductsClient initialProducts={products} categories={categories} />
}
