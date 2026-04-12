export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 10

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing search query', code: 400 }, { status: 400 })
    }

    const searchTerm = q.trim()

    const themeFields = [
      'animeTitle', 
      'animeTitleEnglish', 
      'animeTitleRomaji',
      'animeTitleAlternative', 
      'songTitle', 
      'artistName', 
      'allArtists',
      'type',
      'sequence'
    ]

    const buildRegexQuery = (fields: string[], term: string) => {
      const numSequence = parseInt(term)
      const queries = fields.map(field => {
        if (field === 'sequence' && !isNaN(numSequence)) {
          return { [field]: numSequence }
        }
        if (field === 'type') {
          const upperTerm = term.toUpperCase()
          if (upperTerm === 'OP' || upperTerm === 'ED') {
            return { [field]: upperTerm }
          }
        }
        return { [field]: { $regex: term, $options: 'i' } }
      })
      return { $or: queries }
    }

    const themeQuery = buildRegexQuery(themeFields, searchTerm)
    const skip = (page - 1) * limit

    const [themes, total] = await Promise.all([
      ThemeCache.find(themeQuery).skip(skip).limit(limit).lean(),
      ThemeCache.countDocuments(themeQuery),
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          themes,
        },
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
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