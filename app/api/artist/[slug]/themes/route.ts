import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50

    const skip = (page - 1) * limit

    const [themes, total] = await Promise.all([
      ThemeCache.find({ artistSlugs: slug })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThemeCache.countDocuments({ artistSlugs: slug }),
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
    console.error('Get artist themes error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
