import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const count = await Notification.countDocuments({
      userId: payload.userId,
      isRead: false,
    })

    return NextResponse.json(
      {
        success: true,
        data: { count },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
