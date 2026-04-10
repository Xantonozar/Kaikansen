import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Friendship, Notification } from '@/lib/models'
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

    const friendship = await Friendship.findById(id).lean()

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship not found', code: 404 },
        { status: 404 }
      )
    }

    const userId = new Types.ObjectId(payload.userId)
    const isAddressee = friendship.addresseeId.equals(userId)

    if (!isAddressee) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to accept this request', code: 403 },
        { status: 403 }
      )
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Friendship already processed', code: 400 },
        { status: 400 }
      )
    }

    await Friendship.findByIdAndUpdate(id, { status: 'accepted' })

    await Notification.create({
      recipientId: friendship.requesterId,
      actorId: userId,
      type: 'friend_accepted',
      entityId: id,
      read: false,
    })

    return NextResponse.json(
      { success: true, data: { status: 'accepted' } },
      { status: 200 }
    )
  } catch (error) {
    console.error('Accept friendship error:', error)
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
    const userId = new Types.ObjectId(payload.userId)

    const friendship = await Friendship.findById(id).lean()

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: 'Friendship not found', code: 404 },
        { status: 404 }
      )
    }

    const isParticipant =
      friendship.requesterId.equals(userId) || friendship.addresseeId.equals(userId)

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not authorized', code: 403 },
        { status: 403 }
      )
    }

    await Friendship.findByIdAndDelete(id)

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