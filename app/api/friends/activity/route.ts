import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Friendship, Rating, ThemeCache } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { Types } from 'mongoose'

export const dynamic = 'force-dynamic'

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

    const userId = new Types.ObjectId(payload.userId)

    const friendships = await Friendship.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { addresseeId: userId, status: 'accepted' },
      ],
    }).lean()

    const friendIds = friendships.map((f) =>
      f.requesterId.equals(userId) ? f.addresseeId : f.requesterId
    )

    if (friendIds.length === 0) {
      return NextResponse.json(
        { success: true, data: [], meta: { page: 1, total: 0, hasMore: false } },
        { status: 200 }
      )
    }

    const activities = await Rating.find({
      userId: { $in: friendIds },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'userId',
        select: 'username displayName avatarUrl',
      })
      .lean()

    const themeSlugs = activities.map((a) => a.themeSlug)
    const themes = await ThemeCache.find({ slug: { $in: themeSlugs } })
      .select('slug songTitle artistName animeCoverImage type sequence')
      .lean()

    const themeMap = new Map(themes.map((t) => [t.slug, t]))

    const result = activities.map((activity) => {
      const user = activity.userId as unknown as {
        _id: Types.ObjectId
        username: string
        displayName: string
        avatarUrl: string | null
      }
      const theme = themeMap.get(activity.themeSlug)
      return {
        userId: user?._id?.toString(),
        username: user?.username,
        displayName: user?.displayName,
        avatarUrl: user?.avatarUrl,
        themeSlug: activity.themeSlug,
        theme: theme
          ? {
              slug: theme.slug,
              songTitle: theme.songTitle,
              artistName: theme.artistName,
              animeCoverImage: theme.animeCoverImage,
              type: theme.type,
              sequence: theme.sequence,
            }
          : null,
        score: activity.score,
        mode: activity.mode,
        createdAt: activity.createdAt,
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: { page: 1, total: result.length, hasMore: false },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Friends activity error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}