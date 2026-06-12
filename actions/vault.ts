"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/data"

export async function getVaultCredentialsAction(orderId: string) {
  // 1. Fallback if Supabase is unconfigured
  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured, simulating credentials reveal for order:", orderId)
    return {
      success: true,
      credentials:
        "🔐 [MOCK CREDENTIALS]\n" +
        "Service: ChatGPT Plus (Private Account)\n" +
        "Email: user.tunisia@digitalservices4u.com\n" +
        "Password: SaaSPremiumAccess99!\n" +
        "Profile Name: Customer Profile\n" +
        "Security PIN: 2026\n\n" +
        "⚠️ Please do not modify the email or billing info. Change password at your own risk.",
    }
  }

  try {
    const supabase = await createClient()

    // 2. Authenticate session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "You must be logged in to view vault credentials." }
    }

    // 3. Query secure_vault. Supabase RLS policies will enforce:
    // - User is order owner
    // - Order status is 'Delivered'
    const { data, error } = await supabase
      .from("secure_vault")
      .select("credentials_text")
      .eq("order_id", orderId)
      .single()

    if (error || !data) {
      console.warn("Vault access denied by RLS or record missing:", error)
      return {
        success: false,
        error: "Access denied. Your order must be marked 'Delivered' by an admin to unlock credentials.",
      }
    }

    return { success: true, credentials: data.credentials_text }
  } catch (err) {
    console.error("Critical error in getVaultCredentialsAction:", err)
    return { success: false, error: "An unexpected error occurred while fetching credentials." }
  }
}
