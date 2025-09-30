import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "Email and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      )
    }

    // 生成新密码哈希
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // 更新密码
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ password_hash: passwordHash })
      .eq("email", email)

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
