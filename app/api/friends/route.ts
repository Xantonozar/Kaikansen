export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Friendship, User, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { z } from 'zod'

const friendRequestSchema = z.object({
  friendId: z.string(),
})

const friendActionSchema = z.object({
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
    const checkUsername = url.searchParams.get('check')
    const requestUsername = url.searchParams.get('request')
    
    // Check friendship status
    if (checkUsername) {
      const targetUser = await User.findOne({ username: checkUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      const friendship = await Friendship.findOne({
        $or: [
          { userId: payload.userId, friendId: targetUser._id },
          { userId: targetUser._id, friendId: payload.userId },
        ],
      })
      let status = 'none'
      if (friendship?.status === 'accepted') status = 'accepted'
      else if (friendship?.status === 'pending') status = 'pending'
      return NextResponse.json({ success: true, data: { status } }, { status: 200 })
    }
    
    // Send friend request
    if (requestUsername) {
      const targetUser = await User.findOne({ username: requestUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      if (targetUser._id.toString() === payload.userId) {
        return NextResponse.json({ success: false, error: 'Cannot add yourself', code: 400 }, { status: 400 })
      }
      const existing = await Friendship.findOne({
        $or: [
          { userId: payload.userId, friendId: targetUser._id },
          { userId: targetUser._id, friendId: payload.userId },
        ],
      })
      if (existing) {
        return NextResponse.json({ success: false, error: existing.status === 'accepted' ? 'Already friends' : 'Request pending', code: 409 }, { status: 409 })
      }
      const friendship = new Friendship({ userId: payload.userId, friendId: targetUser._id, status: 'pending' })
      await friendship.save()
      return NextResponse.json({ success: true, data: { status: 'pending' } }, { status: 201 })
    }
    
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50
    const skip = (page - 1) * limit

    const [friendships, total] = await Promise.all([
      Friendship.find({
        $or: [{ userId: payload.userId }, { friendId: payload.userId }],
        status: 'accepted',
      })
        .populate('userId', '-passwordHash')
        .populate('friendId', '-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Friendship.countDocuments({
        $or: [{ userId: payload.userId }, { friendId: payload.userId }],
        status: 'accepted',
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: friendships,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get friends error:', error)
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

    const url = new URL(request.url)
    const checkUsername = url.searchParams.get('check')
    const requestUsername = url.searchParams.get('request')

    let friendId
    if (checkUsername) {
      const targetUser = await User.findOne({ username: checkUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      friendId = targetUser._id
    } else if (requestUsername) {
      const targetUser = await User.findOne({ username: requestUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      friendId = targetUser._id
    } else {
      const body = await request.json()
      const parsed = friendRequestSchema.parse(body)
      friendId = parsed.friendId
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { userId: payload.userId, friendId },
        { userId: friendId, friendId: payload.userId },
      ],
    })

    if (existingFriendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship already exists', code: 409 },
        { status: 409 }
      )
    }

    const friendship = new Friendship({
      userId: payload.userId,
      friendId,
      status: 'pending',
    })

    await friendship.save()

    // Create notification
    await Notification.create({
      userId: friendId,
      type: 'friend_request',
      fromUserId: payload.userId,
    })

    return NextResponse.json(
      { success: true, data: friendship.toObject() },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 400 },
        { status: 400 }
      )
    }

    console.error('Send friend request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
