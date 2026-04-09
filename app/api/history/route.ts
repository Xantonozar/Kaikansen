import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { WatchHistory } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { z } from 'zod'

const historySchema = z.object({
  themeSlug: z.string().min(1),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { themeSlug } = historySchema.parse(body)

    const history = await WatchHistory.findOneAndUpdate(
      { userId: payload.userId, themeSlug },
      {
        $set: { lastWatchedAt: new Date() },
        $inc: { watchCount: 1 },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json(
      { success: true, data: history.toObject() },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 400 },
        { status: 400 }
      )
    }

    console.error('History error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

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

    const [history, total] = await Promise.all([
      WatchHistory.find({ userId: payload.userId })
        .sort({ lastWatchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WatchHistory.countDocuments({ userId: payload.userId }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: history,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
