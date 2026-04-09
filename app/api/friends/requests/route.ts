export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Friendship, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { z } from 'zod'

const actionSchema = z.object({
  action: z.enum(['accept', 'reject']),
})

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

    const [requests, total] = await Promise.all([
      Friendship.find({
        friendId: payload.userId,
        status: 'pending',
      })
        .populate('userId', '-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Friendship.countDocuments({
        friendId: payload.userId,
        status: 'pending',
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: requests,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get friend requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

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
    const { action } = actionSchema.parse(body)
    const friendshipId = new URL(request.url).searchParams.get('id')

    const friendship = await Friendship.findById(friendshipId)

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship not found', code: 404 },
        { status: 404 }
      )
    }

    if (friendship.friendId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    if (action === 'accept') {
      friendship.status = 'accepted'
      await friendship.save()

      await Notification.create({
        userId: friendship.userId,
        type: 'friend_accepted',
        fromUserId: payload.userId,
      })
    } else {
      await Friendship.deleteOne({ _id: friendshipId })
    }

    return NextResponse.json(
      { success: true, data: friendship.toObject() },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 400 },
        { status: 400 }
      )
    }

    console.error('Friend request action error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
