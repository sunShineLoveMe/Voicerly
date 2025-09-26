import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { makeUserClient } from '@/lib/supabase/supabaseAdmin'

const UpdateProfileSchema = z.object({
  p_display_name: z.string().min(1, 'Display name is required'),
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authorization header required' } },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const userClient = makeUserClient(accessToken)

    const body = await request.json()
    const { p_display_name } = UpdateProfileSchema.parse(body)

    const { error } = await userClient.rpc('update_profile', { p_display_name })

    if (error) {
      return NextResponse.json(
        { error: { code: 'RPC_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    // Verify the update
    const { data: profileData, error: profileError } = await userClient
      .from('profiles')
      .select('display_name, credits')
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: { code: 'PROFILE_FETCH_ERROR', message: profileError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
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
