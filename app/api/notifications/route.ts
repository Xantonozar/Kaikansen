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

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: payload.userId })
        .populate('fromUserId', '-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: payload.userId }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
