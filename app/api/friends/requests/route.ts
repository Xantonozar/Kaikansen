export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { Types } from 'mongoose'
import { z } from 'zod'

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

    const currentUserId = new Types.ObjectId(payload.userId)

    const user = await User.findById(currentUserId).lean()
    if (!user) {
      return NextResponse.json({ success: true, data: [], meta: { total: 0 } }, { status: 200 })
    }

    const requestIds = user.pendingRequests || []
    const requests = await User.find({
      _id: { $in: requestIds },
    }).select('username displayName avatarUrl bio').lean()

    const total = requests.length

    return NextResponse.json(
      {
        success: true,
        data: requests,
        meta: { total },
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
    const { action, requestId } = z.object({
      action: z.enum(['accept', 'reject']),
      requestId: z.string(),
    }).parse(body)

    const currentUserId = new Types.ObjectId(payload.userId)
    const requesterId = new Types.ObjectId(requestId)

    // Verify the request is in current user's pendingRequests
    const currentUser = await User.findById(currentUserId).lean()
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
    }

    const hasPending = currentUser.pendingRequests?.some((uid: Types.ObjectId) => uid.equals(requesterId))
    if (!hasPending) {
      return NextResponse.json(
        { success: false, error: 'No pending request from this user', code: 404 },
        { status: 404 }
      )
    }

    if (action === 'accept') {
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          {
            $pull: { pendingRequests: requesterId },
            $addToSet: { friends: requesterId },
          }
        ),
        User.updateOne(
          { _id: requesterId },
          {
            $pull: { sentRequests: currentUserId },
            $addToSet: { friends: currentUserId },
          }
        ),
      ])

      await Notification.create({
        userId: requesterId,
        type: 'friend_accepted',
        fromUserId: currentUserId,
      })
    } else {
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $pull: { pendingRequests: requesterId } }
        ),
        User.updateOne(
          { _id: requesterId },
          { $pull: { sentRequests: currentUserId } }
        ),
      ])
    }

    return NextResponse.json(
      { success: true, data: { status: action === 'accept' ? 'accepted' : 'rejected' } },
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