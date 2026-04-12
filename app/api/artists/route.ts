export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ArtistCache } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50
    const skip = (page - 1) * limit
    const search = url.searchParams.get('q') || ''

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { aliases: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const [artists, total] = await Promise.all([
      ArtistCache.find(query)
        .sort({ totalThemes: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ArtistCache.countDocuments(query),
    ])

    return NextResponse.json(
      {
        success: true,
        data: artists,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get artists error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}