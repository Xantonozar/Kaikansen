export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, ThemeCache, Friendship, Rating } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const [totalUsers, totalThemes, totalRatings] = await Promise.all([
      User.countDocuments({}),
      ThemeCache.countDocuments({}),
      Rating.countDocuments({}),
    ])

    // Get top rated themes
    const topRated = await Rating.aggregate([
      {
        $group: {
          _id: '$themeSlug',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 3 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          totalUsers,
          totalThemes,
          totalRatings,
          topRated,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
