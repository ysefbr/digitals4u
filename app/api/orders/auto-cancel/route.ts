import { NextRequest, NextResponse } from "next/server"
import { runAutoCancelAction } from "@/actions/auto-cancel"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // If CRON_SECRET is not configured in env, we allow it in development mode,
    // but block in production for security.
    return process.env.NODE_ENV === "development"
  }

  // 1. Check header
  const authHeader = req.headers.get("authorization")
  if (authHeader === `Bearer ${secret}`) {
    return true
  }

  // 2. Check query parameter
  const querySecret = req.nextUrl.searchParams.get("secret")
  if (querySecret === secret) {
    return true
  }

  return false
}

async function handleAutoCancel(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized access. Invalid cron secret token." },
      { status: 401 }
    )
  }

  const result = await runAutoCancelAction()
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}

export async function GET(req: NextRequest) {
  return handleAutoCancel(req)
}

export async function POST(req: NextRequest) {
  return handleAutoCancel(req)
}
