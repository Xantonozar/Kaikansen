import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { Types } from 'mongoose'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const currentUserId = new Types.ObjectId(payload.userId)

    const body = await request.json()
    const { action } = z.object({ action: z.enum(['accept', 'reject']) }).parse(body)

    const requesterId = new Types.ObjectId(id)
    
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
      // Move from pendingRequests -> friends for both users
      // Also remove from requester's sentRequests
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

      return NextResponse.json(
        { success: true, data: { status: 'accepted' } },
        { status: 200 }
      )
    } else {
      // Reject - just remove from pendingRequests
      await User.updateOne(
        { _id: currentUserId },
        { $pull: { pendingRequests: requesterId } }
      )
      await User.updateOne(
        { _id: requesterId },
        { $pull: { sentRequests: currentUserId } }
      )

      return NextResponse.json(
        { success: true, data: { status: 'rejected' } },
        { status: 200 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 400 },
        { status: 400 }
      )
    }
    console.error('Friend request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const currentUserId = new Types.ObjectId(payload.userId)
    const targetId = new Types.ObjectId(id)

    // Remove from all relationship arrays for both users
    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        {
          $pull: {
            friends: targetId,
            pendingRequests: targetId,
            sentRequests: targetId,
          },
        }
      ),
      User.updateOne(
        { _id: targetId },
        {
          $pull: {
            friends: currentUserId,
            pendingRequests: currentUserId,
            sentRequests: currentUserId,
          },
        }
      ),
    ])

    return NextResponse.json(
      { success: true, data: { status: 'deleted' } },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete friendship error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}