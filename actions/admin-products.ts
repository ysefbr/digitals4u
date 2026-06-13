"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/data"
import { revalidatePath } from "next/cache"

async function verifyAdmin(supabase: any) {
  if (!isSupabaseConfigured()) return true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    return profile?.role === "admin"
  } catch (err) {
    console.error("Admin verification failed:", err)
    return false
  }
}

export async function createProductAction(data: {
  title: string
  description: string
  price: number
  stock_count: number
  category_id?: string
  is_active: boolean
  image?: string
}) {
  if (!data.title || !data.description || data.price < 0 || data.stock_count < 0) {
    return { success: false, error: "Please provide valid product details." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating product creation:", data)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase.from("products").insert({
      title: data.title,
      description: data.description,
      price: data.price,
      stock_count: data.stock_count,
      category_id: data.category_id || null,
      is_active: data.is_active,
      image: data.image || null,
    })

    if (error) {
      console.error("Error creating product:", error)
      return { success: false, error: "Failed to create product in database." }
    }

    revalidatePath("/catalog")
    return { success: true }
  } catch (err) {
    console.error("createProductAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function updateProductAction(
  productId: string,
  data: {
    title: string
    description: string
    price: number
    stock_count: number
    category_id?: string
    is_active: boolean
    image?: string
  }
) {
  if (!productId || !data.title || !data.description || data.price < 0 || data.stock_count < 0) {
    return { success: false, error: "Please provide valid product details." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating product update:", productId, data)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase
      .from("products")
      .update({
        title: data.title,
        description: data.description,
        price: data.price,
        stock_count: data.stock_count,
        category_id: data.category_id || null,
        is_active: data.is_active,
        image: data.image || null,
      })
      .eq("id", productId)

    if (error) {
      console.error("Error updating product:", error)
      return { success: false, error: "Failed to update product details." }
    }

    revalidatePath("/catalog")
    revalidatePath(`/products/${productId}`)
    return { success: true }
  } catch (err) {
    console.error("updateProductAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function toggleProductActiveAction(productId: string, is_active: boolean) {
  if (!productId) return { success: false, error: "Invalid product ID." }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating active status toggle:", productId, is_active)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase
      .from("products")
      .update({ is_active })
      .eq("id", productId)

    if (error) {
      console.error("Error toggling active status:", error)
      return { success: false, error: "Failed to toggle product status." }
    }

    revalidatePath("/catalog")
    revalidatePath(`/products/${productId}`)
    return { success: true }
  } catch (err) {
    console.error("toggleProductActiveAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}
