import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signAccessToken, signRefreshToken } from '@/lib/auth'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await User.findOne({ email }).lean()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 401 },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 401 },
        { status: 401 }
      )
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          user: {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
          },
        },
      },
      { status: 200 }
    )

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          code: 400,
        },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
