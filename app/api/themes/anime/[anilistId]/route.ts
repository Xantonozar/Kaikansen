export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anilistId: string }> }
) {
  try {
    await connectDB()

    const { anilistId: anilistIdStr } = await params
    const anilistId = parseInt(anilistIdStr)
    if (!anilistId) {
      return NextResponse.json(
        { success: false, error: 'Invalid anime ID', code: 400 },
        { status: 400 }
      )
    }

    const themes = await ThemeCache.find({ animeAniListId: anilistId }).limit(50)

    if (!themes.length) {
      return NextResponse.json(
        { success: false, error: 'Anime not found', code: 404 },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          title: themes[0]?.animeTitle || '',
          anilistId,
          themes,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching anime themes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
