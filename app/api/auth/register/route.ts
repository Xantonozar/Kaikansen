export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signAccessToken, signRefreshToken } from '@/lib/auth'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(20).toLowerCase(),
  email: z.string().email(),
  password: z.string().min(6),
})

const PLACEHOLDER_AVATARS = [
  '/avatars/1.svg',
  '/avatars/2.svg',
  '/avatars/3.svg',
  '/avatars/4.svg',
  '/avatars/5.svg',
]

function getRandomAvatar(): string {
  return PLACEHOLDER_AVATARS[Math.floor(Math.random() * PLACEHOLDER_AVATARS.length)]
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { username, email, password } = registerSchema.parse(body)

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email or username already exists', code: 409 },
        { status: 409 }
      )
    }

    const passwordHash = await bcryptjs.hash(password, 12)

    const user = new User({
      username,
      email,
      passwordHash,
      displayName: username,
      avatarUrl: getRandomAvatar(),
      isPublic: true,
    })

    await user.save()

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
      { status: 201 }
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

    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}