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

export async function createCategoryAction(data: { name: string; slug: string }) {
  if (!data.name || !data.slug) {
    return { success: false, error: "Please provide valid category details." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating category creation:", data)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase.from("categories").insert({
      name: data.name,
      slug: data.slug,
    })

    if (error) {
      console.error("Error creating category:", error)
      return { success: false, error: "Failed to create category in database." }
    }

    revalidatePath("/catalog")
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    return { success: true }
  } catch (err) {
    console.error("createCategoryAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function updateCategoryAction(id: string, data: { name: string; slug: string }) {
  if (!id || !data.name || !data.slug) {
    return { success: false, error: "Please provide valid category details." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating category update:", id, data)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase
      .from("categories")
      .update({
        name: data.name,
        slug: data.slug,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating category:", error)
      return { success: false, error: "Failed to update category details." }
    }

    revalidatePath("/catalog")
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    return { success: true }
  } catch (err) {
    console.error("updateCategoryAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}

export async function deleteCategoryAction(id: string) {
  if (!id) return { success: false, error: "Invalid category ID." }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating category deletion:", id)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    // Check if any products exist using this category
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1)

    if (products && products.length > 0) {
      return { success: false, error: "Cannot delete category: it is being used by existing products." }
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      return { success: false, error: "Failed to delete category from database." }
    }

    revalidatePath("/catalog")
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    return { success: true }
  } catch (err) {
    console.error("deleteCategoryAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}
