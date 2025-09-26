import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { makeUserClient } from '@/lib/supabase/supabaseAdmin'

const DeductCreditsSchema = z.object({
  cost: z.number().positive('Cost must be positive'),
  reason: z.string().min(1, 'Reason is required'),
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
    const { cost, reason } = DeductCreditsSchema.parse(body)

    const { data, error } = await userClient.rpc('deduct_credits', { cost, reason })

    if (error) {
      return NextResponse.json(
        { error: { code: 'RPC_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Credits deducted successfully',
      data: { new_balance: data[0]?.new_balance }
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
