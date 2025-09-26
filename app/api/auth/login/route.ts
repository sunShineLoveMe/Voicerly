import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabasePublic } from '@/lib/supabase/supabasePublic'

const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    const { data: loginData, error: loginError } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      return NextResponse.json(
        { error: { code: 'LOGIN_FAILED', message: loginError.message } },
        { status: 401 }
      )
    }

    if (!loginData.session?.access_token) {
      return NextResponse.json(
        { error: { code: 'NO_TOKEN', message: 'No access token received' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: loginData.session.access_token,
        user_id: loginData.user.id,
        email: loginData.user.email
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
