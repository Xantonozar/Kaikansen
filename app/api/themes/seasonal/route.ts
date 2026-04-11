export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const season = url.searchParams.get('season')
    const year = url.searchParams.get('year')
    const type = url.searchParams.get('type')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50

    if (!season || !year) {
      return NextResponse.json(
        { success: false, error: 'season and year parameters required', code: 400 },
        { status: 400 }
      )
    }

    const query: Record<string, unknown> = { animeSeason: season.toUpperCase(), animeSeasonYear: parseInt(year) }
    if (type) query.type = type

    const skip = (page - 1) * limit

    const [themes, total] = await Promise.all([
      ThemeCache.find(query)
        .sort({ type: 1, sequence: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThemeCache.countDocuments(query),
    ])

    return NextResponse.json(
      {
        success: true,
        data: themes,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get seasonal themes error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
