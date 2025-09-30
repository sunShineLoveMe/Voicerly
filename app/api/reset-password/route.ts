import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    // 参数校验 - 邮箱必须trim和小写
    const trimmedEmail = email?.trim().toLowerCase()
    const trimmedCode = code?.trim()
    const trimmedPassword = newPassword?.trim()

    if (!trimmedEmail || !trimmedCode || !trimmedPassword) {
      return NextResponse.json(
        { ok: false, error: "Email, code, and new password are required" },
        { status: 400 }
      )
    }

    // 邮箱格式校验
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // 验证码格式校验
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json(
        { ok: false, error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // 密码规则：≥8位，包含字母+数字
    if (trimmedPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!/[a-zA-Z]/.test(trimmedPassword) || !/\d/.test(trimmedPassword)) {
      return NextResponse.json(
        { ok: false, error: "Password must contain letters and numbers" },
        { status: 400 }
      )
    }

    // 首先验证OTP - 调用Worker的verify-otp API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || ""
    const verifyUrl = `${apiBase}/api/verify-otp`
    
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: trimmedEmail, code: trimmedCode }),
    })

    const verifyData = await verifyResponse.json()
    
    if (!verifyResponse.ok || !verifyData.ok) {
      return NextResponse.json(
        { ok: false, error: verifyData.error || "Invalid or expired verification code" },
        { status: 401 }
      )
    }

    // 检查用户是否存在
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", trimmedEmail)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      )
    }

    // 生成新密码哈希
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(trimmedPassword, salt)

    // 更新密码
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ password_hash: passwordHash })
      .eq("email", trimmedEmail)

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
