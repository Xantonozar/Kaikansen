import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Follow, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'

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

    if (action === 'follow') {
      const existingFollow = await Follow.findOne({
        followerId: payload.userId,
        followingId: username,
      })

      if (existingFollow) {
        return NextResponse.json(
          { success: false, error: 'Already following', code: 409 },
          { status: 409 }
        )
      }

      const follow = new Follow({
        followerId: payload.userId,
        followingId: username,
      })

      await follow.save()

      await Notification.create({
        userId: username,
        type: 'followed',
        fromUserId: payload.userId,
      })

      return NextResponse.json(
        { success: true, data: follow.toObject() },
        { status: 201 }
      )
    } else if (action === 'unfollow') {
      await Follow.deleteOne({
        followerId: payload.userId,
        followingId: username,
      })

      return NextResponse.json(
        { success: true, data: { message: 'Unfollowed' } },
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
