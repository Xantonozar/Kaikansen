export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache, ArtistCache } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'))
    const by = url.searchParams.get('by')

    console.log('[SEARCH] Request received:', { q, page, limit, by })

    if (!q || q.trim().length === 0) {
      console.log('[SEARCH] Missing q parameter')
      return NextResponse.json({ success: false, error: 'Missing search query', code: 400 }, { status: 400 })
    }

    const searchTerm = q.trim()
    console.log('[SEARCH] Search term:', searchTerm)

    const themeFields = ['animeTitle', 'animeTitleEnglish', 'animeTitleAlternative', 'songTitle', 'artistName', 'allArtists']
    const artistFields = ['name', 'aliases']

    const buildRegexQuery = (fields: string[], term: string) => ({
      $or: fields.map(field => ({ [field]: { $regex: term, $options: 'i' } }))
    })

    let themeQuery: Record<string, unknown> = {}
    let artistQuery: Record<string, unknown> = {}

    if (by === 'anime') {
      themeQuery = buildRegexQuery(['animeTitle', 'animeTitleEnglish', 'animeTitleAlternative'], searchTerm)
    } else if (by === 'song') {
      themeQuery = buildRegexQuery(['songTitle'], searchTerm)
    } else if (by === 'singer') {
      themeQuery = buildRegexQuery(['artistName', 'allArtists'], searchTerm)
    } else {
      themeQuery = buildRegexQuery(themeFields, searchTerm)
      artistQuery = buildRegexQuery(artistFields, searchTerm)
    }

    console.log('[SEARCH] Theme query:', JSON.stringify(themeQuery))
    console.log('[SEARCH] Artist query:', JSON.stringify(artistQuery))

    const skip = (page - 1) * limit

    const [themes, artists, themeCount, artistCount] = await Promise.all([
      themeQuery ? ThemeCache.find(themeQuery).sort({ avgRating: -1, totalRatings: -1 }).skip(skip).limit(limit).lean() : [],
      artistQuery ? ArtistCache.find(artistQuery).sort({ totalThemes: -1 }).skip(skip).limit(Math.floor(limit / 2)).lean() : [],
      themeQuery ? ThemeCache.countDocuments(themeQuery) : 0,
      artistQuery ? ArtistCache.countDocuments(artistQuery) : 0,
    ])

    console.log('[SEARCH] Results:', { themeCount, artistCount, themesFound: themes.length, artistsFound: artists.length })

    return NextResponse.json(
      {
        success: true,
        data: {
          themes,
          artists,
        },
        meta: {
          page,
          total: by === 'artist' ? artistCount : themeCount,
          hasMore: skip + limit < (by === 'artist' ? artistCount : themeCount),
          query: q,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[SEARCH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}