import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token', code: 401 },
        { status: 401 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token', code: 401 },
        { status: 401 }
      )
    }

    const user = await User.findById(payload.userId).lean()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 404 },
        { status: 404 }
      )
    }

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    }

    const accessToken = signAccessToken(newPayload)
    const newRefreshToken = signRefreshToken(newPayload)

    const response = NextResponse.json(
      {
        success: true,
        data: { accessToken },
      },
      { status: 200 }
    )

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
