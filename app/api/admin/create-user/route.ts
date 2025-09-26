import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin'

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = CreateUserSchema.parse(body)

    // Check if user already exists by listing users
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    if (getUserError) {
      return NextResponse.json(
        { error: { code: 'USER_CHECK_FAILED', message: getUserError.message } },
        { status: 500 }
      )
    }

    const existingUser = users?.users?.find((user: any) => user.email === email)
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        data: { id: existingUser.id, email: existingUser.email }
      })
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json(
        { error: { code: 'USER_CREATION_FAILED', message: createError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: { id: newUser.user.id, email: newUser.user.email }
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
