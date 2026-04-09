import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB()

    const { username } = await params

    const user = await User.findOne({ username })
      .select('-passwordHash')
      .lean()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 404 },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
