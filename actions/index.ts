"use server"

// Next.js Server Actions for DigitalServices4U

export async function pingAction() {
  return { success: true, message: "Server action is working!" }
}
