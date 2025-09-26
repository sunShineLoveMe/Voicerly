import { NextRequest, NextResponse } from 'next/server'
import { makeUserClient } from '@/lib/supabase/supabaseAdmin'

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

    const { data, error } = await userClient.rpc('grant_signup_bonus')

    if (error) {
      return NextResponse.json(
        { error: { code: 'RPC_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Signup bonus granted',
      data: { new_balance: data[0]?.new_balance }
    })

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
