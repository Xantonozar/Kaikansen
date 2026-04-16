import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export const dynamic = 'force-dynamic'

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

    // Find all themes for this anime
    const themes = await ThemeCache.find({ anilistId })
      .sort({ type: 1, sequence: 1 })
      .lean()

    if (themes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Anime not found', code: 404 },
        { status: 404 }
      )
    }

    // Build anime data from first theme
    const firstTheme = themes[0]
    
    const anime = {
      anilistId: firstTheme.anilistId,
      titleRomaji: firstTheme.animeTitle,
      titleEnglish: firstTheme.animeTitleEnglish,
      coverImage: firstTheme.animeCoverImage || firstTheme.animeGrillImage,
      bannerImage: firstTheme.animeBannerImage,
      animeGrillImage: firstTheme.animeGrillImage,
      synopsis: firstTheme.animeSynopsis,
      format: firstTheme.animeMediaFormat,
      totalEpisodes: themes.length,
    }

    const openings = themes.filter((t) => t.type === 'OP')
    const endings = themes.filter((t) => t.type === 'ED')

    return NextResponse.json(
      {
        success: true,
        data: {
          anime,
          themes,
          openings,
          endings,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching anime:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}