import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, code } = await req.json()

    // 参数校验 - 邮箱必须trim和小写
    const trimmedEmail = email?.trim().toLowerCase()
    const trimmedPassword = password?.trim()
    const trimmedCode = code?.trim()

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!trimmedCode) {
      return NextResponse.json(
        { ok: false, error: "Verification code is required" },
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

    // 验证邮件验证码
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || ""
    const verifyUrl = `${apiBase}/api/verify-otp`

    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: trimmedEmail, code: trimmedCode }),
    })

    const verifyData = await verifyResponse.json().catch(() => ({ ok: false }))

    if (!verifyResponse.ok || !verifyData?.ok) {
      return NextResponse.json(
        { ok: false, error: verifyData?.error || "Invalid or expired verification code" },
        { status: 401 }
      )
    }

    // 生成密码哈希
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(trimmedPassword, salt)

    // 生成 UUID
    const uuid = crypto.randomUUID()

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", trimmedEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      )
    }

    // 插入新用户到 profiles 表
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: uuid,
        email: trimmedEmail,
        password_hash: passwordHash,
        display_name: displayName?.trim() || null,
        credits: 10,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    // 返回成功（不包含敏感信息）
    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        credits: data.credits ?? 10,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
