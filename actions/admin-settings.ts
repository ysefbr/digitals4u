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

export async function updateSettingsAction(data: {
  whatsapp_number: string
  site_name: string
}) {
  if (!data.whatsapp_number || !data.site_name) {
    return { success: false, error: "Please fill in all configuration details." }
  }

  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Simulating settings update:", data)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const isAdmin = await verifyAdmin(supabase)
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access. Admins only." }
    }

    const { error } = await supabase
      .from("settings")
      .update({
        whatsapp_number: data.whatsapp_number,
        site_name: data.site_name,
      })
      .eq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      console.error("Error updating settings:", error)
      return { success: false, error: "Failed to update platform settings." }
    }

    revalidatePath("/")
    revalidatePath("/catalog")
    return { success: true }
  } catch (err) {
    console.error("updateSettingsAction error:", err)
    return { success: false, error: "An unexpected server error occurred." }
  }
}
