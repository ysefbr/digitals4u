import { createClient } from "@/lib/supabase/server"
import { MOCK_CATEGORIES, MOCK_PRODUCTS, isSupabaseConfigured } from "./data"

// Dynamic API getters (Server-only)
export async function getCategories() {
  if (!isSupabaseConfigured()) {
    return MOCK_CATEGORIES
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES
    }
    return data
  } catch (err) {
    console.warn("Supabase fetch categories failed, falling back to mock data:", err)
    return MOCK_CATEGORIES
  }
}

export async function getProducts(options?: { categorySlug?: string; search?: string; maxPrice?: number }) {
  if (!isSupabaseConfigured()) {
    let filtered = [...MOCK_PRODUCTS]
    if (options?.categorySlug) {
      filtered = filtered.filter(p => p.category.slug === options.categorySlug)
    }
    if (options?.search) {
      const q = options.search.toLowerCase()
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (options?.maxPrice) {
      filtered = filtered.filter(p => p.price <= options.maxPrice!)
    }
    return filtered
  }

  try {
    const supabase = await createClient()
    let query = supabase
      .from("products")
      .select("*, category:categories(name, slug)")
      .eq("is_active", true)

    if (options?.search) {
      query = query.ilike("title", `%${options.search}%`)
    }
    if (options?.maxPrice) {
      query = query.lte("price", options.maxPrice)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      let filtered = [...MOCK_PRODUCTS]
      if (options?.categorySlug) {
        filtered = filtered.filter(p => p.category.slug === options.categorySlug)
      }
      if (options?.maxPrice) {
        filtered = filtered.filter(p => p.price <= options.maxPrice!)
      }
      return filtered
    }

    const products = data.map(item => {
      const mockMatch = MOCK_PRODUCTS.find(p => p.title.toLowerCase() === item.title.toLowerCase())
      return {
        ...item,
        category: item.category || { name: "Uncategorized", slug: "uncategorized" },
        features: mockMatch ? mockMatch.features : ["Premium digital delivery", "WhatsApp active support", "Access guaranteed"]
      }
    })

    if (options?.categorySlug) {
      return products.filter(p => p.category.slug === options.categorySlug)
    }

    return products
  } catch (err) {
    console.warn("Supabase fetch products failed, falling back to mock data:", err)
    return MOCK_PRODUCTS
  }
}

export async function getProductById(id: string) {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(name, slug)")
      .eq("id", id)
      .single()

    if (error || !data) {
      return MOCK_PRODUCTS.find(p => p.id === id) || null
    }

    const mockMatch = MOCK_PRODUCTS.find(p => p.title.toLowerCase() === data.title.toLowerCase())
    return {
      ...data,
      category: data.category || { name: "Uncategorized", slug: "uncategorized" },
      features: mockMatch ? mockMatch.features : ["Premium digital delivery", "WhatsApp active support", "Access guaranteed"]
    }
  } catch (err) {
    console.warn(`Supabase fetch product by id ${id} failed, falling back to mock data:`, err)
    return MOCK_PRODUCTS.find(p => p.id === id) || null
  }
}

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) {
    return { whatsapp_number: "+21694268200", site_name: "DigitalServices4U" }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .single()

    if (error || !data) {
      return { whatsapp_number: "+21694268200", site_name: "DigitalServices4U" }
    }
    return data
  } catch (err) {
    return { whatsapp_number: "+21694268200", site_name: "DigitalServices4U" }
  }
}
