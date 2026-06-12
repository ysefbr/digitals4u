"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/data"
import { revalidatePath } from "next/cache"

export async function runAutoCancelAction() {
  if (!isSupabaseConfigured()) {
    console.log("Supabase unconfigured. Skipping auto-cancel execution.")
    return { success: true, cancelledCount: 0, orders: [] }
  }

  try {
    const supabase = await createClient()

    // Execute atomic auto-cancellation via RPC (defined with SECURITY DEFINER to bypass RLS limits securely)
    const { data, error } = await supabase.rpc("auto_cancel_expired_orders")

    if (error) {
      console.error("Error executing auto_cancel_expired_orders RPC:", error)
      return { success: false, error: "Failed to execute auto-cancellation." }
    }

    // Map result array of order IDs
    const cancelledIds: string[] = (data || []).map((row: any) => row.cancelled_order_id || row)

    if (cancelledIds.length > 0) {
      revalidatePath("/portal")
      revalidatePath("/admin/orders")
      revalidatePath("/catalog")
      console.log(`Auto-cancelled ${cancelledIds.length} expired orders:`, cancelledIds)
    }

    return { success: true, cancelledCount: cancelledIds.length, orders: cancelledIds }
  } catch (err) {
    console.error("Auto-cancel error:", err)
    return { success: false, error: "An unexpected error occurred during auto-cancellation." }
  }
}
