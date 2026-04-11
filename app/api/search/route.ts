export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache, ArtistCache } from '@/lib/models'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  page: z.string().optional().transform((v) => Math.max(1, parseInt(v || '1'))),
  limit: z.string().optional().transform((v) => Math.min(50, parseInt(v || '20'))),
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const params = searchSchema.parse({
      q: url.searchParams.get('q'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
    })
    const by = url.searchParams.get('by')

    const skip = (params.page - 1) * params.limit
    const searchTerm = params.q.trim()

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

    const [themes, artists, themeCount, artistCount] = await Promise.all([
      themeQuery ? ThemeCache.find(themeQuery).sort({ avgRating: -1, totalRatings: -1 }).skip(skip).limit(params.limit).lean() : [],
      artistQuery ? ArtistCache.find(artistQuery).sort({ totalThemes: -1 }).skip(skip).limit(Math.floor(params.limit / 2)).lean() : [],
      themeQuery ? ThemeCache.countDocuments(themeQuery) : 0,
      artistQuery ? ArtistCache.countDocuments(artistQuery) : 0,
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          themes,
          artists,
        },
        meta: {
          page: params.page,
          total: by === 'artist' ? artistCount : themeCount,
          hasMore: skip + params.limit < (by === 'artist' ? artistCount : themeCount),
          query: params.q,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid search query', code: 400 },
        { status: 400 }
      )
    }

    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
