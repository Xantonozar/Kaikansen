export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Follow, User, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'

// GET - check if following
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
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

    const { username } = await params
    const targetUser = await User.findOne({ username })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 404 },
        { status: 404 }
      )
    }

    const existingFollow = await Follow.findOne({
      followerId: payload.userId,
      followeeId: targetUser._id,
    })

    return NextResponse.json(
      {
        success: true,
        data: { following: !!existingFollow },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Follow check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

// POST - follow/unfollow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
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

    const { username } = await params
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'follow'

    // Find target user by username
    const targetUser = await User.findOne({ username })
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 404 },
        { status: 404 }
      )
    }

    // Can't follow yourself
    if (targetUser._id.toString() === payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself', code: 400 },
        { status: 400 }
      )
    }

    if (action === 'follow') {
      const existingFollow = await Follow.findOne({
        followerId: payload.userId,
        followeeId: targetUser._id,
      })

      if (existingFollow) {
        return NextResponse.json(
          { success: false, error: 'Already following', code: 409 },
          { status: 409 }
        )
      }

      const follow = new Follow({
        followerId: payload.userId,
        followeeId: targetUser._id,
      })

      await follow.save()

      await Notification.create({
        userId: targetUser._id,
        type: 'followed',
        fromUserId: payload.userId,
      })

      return NextResponse.json(
        { success: true, data: { following: true } },
        { status: 201 }
      )
    } else if (action === 'unfollow') {
      const result = await Follow.deleteOne({
        followerId: payload.userId,
        followeeId: targetUser._id,
      })

      return NextResponse.json(
        { success: true, data: { following: false } },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action', code: 400 },
      { status: 400 }
    )
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}