export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

function parseSearchQuery(q: string, by: string = 'all') {
  const terms = q.toLowerCase().split(/\s+/)
  
  const fieldSets: Record<string, string[]> = {
    all: ['animeTitle', 'animeTitleEnglish', 'animeTitleRomaji', 'animeTitleAlternative', 'songTitle', 'artistName', 'allArtists'],
    song: ['songTitle'],
    artist: ['artistName', 'allArtists'],
    anime: ['animeTitle', 'animeTitleEnglish', 'animeTitleRomaji', 'animeTitleAlternative'],
  }
  
  const textFields = fieldSets[by] || fieldSets.all
  
  let typeFilter: string | null = null
  let sequenceFilter: number | null = null
  const textTerms: string[] = []

  for (const term of terms) {
    const combinedMatch = term.match(/^(op|ed)(\d+)$/i)
    if (combinedMatch) {
      const type = combinedMatch[1].toUpperCase()
      const seq = parseInt(combinedMatch[2])
      if (seq >= 1 && seq <= 99) {
        typeFilter = type === 'OP' ? 'OP' : 'ED'
        sequenceFilter = seq
        continue
      }
    }
    
    if (term === 'op') {
      typeFilter = 'OP'
      continue
    }
    if (term === 'ed') {
      typeFilter = 'ED'
      continue
    }
    
    const num = parseInt(term)
    if (!isNaN(num) && num >= 1 && num <= 99) {
      sequenceFilter = num
      continue
    }
    
    textTerms.push(term)
  }
  
  const queryParts: any[] = []
  
  if (textTerms.length > 0) {
    // Use AND between terms - each term must match at least one field
    const textQuery = {
      $and: textTerms.map(term => ({
        $or: textFields.map(field => ({ [field]: { $regex: term, $options: 'i' } }))
      }))
    }
    queryParts.push(textQuery)
  }

  // OP/ED filters are optional - add them only if specified
  if (typeFilter || sequenceFilter) {
    const filters: any[] = []
    if (typeFilter) filters.push({ type: typeFilter })
    if (sequenceFilter) filters.push({ sequence: sequenceFilter })
    if (filters.length > 0) {
      queryParts.push({ $and: filters })
    }
  }
  
  if (queryParts.length === 0) {
    return {}
  }
  
  if (queryParts.length === 1) {
    return queryParts[0]
  }
  
  return { $and: queryParts }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const by = url.searchParams.get('by') || 'all'
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 100

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing search query', code: 400 }, { status: 400 })
    }

    const searchTerm = q.trim()
    const themeQuery = parseSearchQuery(searchTerm, by)

    // If query is empty (no valid conditions), return empty results
    if (!themeQuery || Object.keys(themeQuery).length === 0) {
      return NextResponse.json({
        success: true,
        data: { themes: [] },
        meta: { page, total: 0, hasMore: false, query: q },
      }, { status: 200 })
    }

    console.log('[SEARCH] Query:', JSON.stringify(themeQuery))
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