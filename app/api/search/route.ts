export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

function parseSearchQuery(q: string) {
  const conditions: any[] = []
  const terms = q.toLowerCase().split(/\s+/)
  
  const textFields = [
    'animeTitle', 
    'animeTitleEnglish', 
    'animeTitleRomaji',
    'animeTitleAlternative', 
    'songTitle', 
    'artistName', 
    'allArtists'
  ]
  
  let typeFilter: string | null = null
  let sequenceFilter: number | null = null
  
  for (const term of terms) {
    // Check for "op1", "op2", "ed1", "ed12" pattern (no space)
    const combinedMatch = term.match(/^(op|ed)(\d+)$/i)
    if (combinedMatch) {
      const type = combinedMatch[1].toUpperCase()
      const seq = parseInt(combinedMatch[2])
      if (seq >= 1 && seq <= 99) {
        if (type === 'OP') typeFilter = 'OP'
        else typeFilter = 'ED'
        sequenceFilter = seq
        continue
      }
    }
    
    // Check for "op", "ed" alone
    if (term === 'op') {
      typeFilter = 'OP'
      continue
    }
    if (term === 'ed') {
      typeFilter = 'ED'
      continue
    }
    
    // Check for standalone number (sequence)
    const num = parseInt(term)
    if (!isNaN(num) && num >= 1 && num <= 99) {
      sequenceFilter = num
      continue
    }
    
    // Otherwise, treat as text search
    const textConditions = textFields.map(field => ({
      [field]: { $regex: term, $options: 'i' }
    }))
    conditions.push({ $or: textConditions })
  }
  
  // Build final query with all conditions
  const query: any = { $and: [] }
  
  if (conditions.length > 0) {
    query.$and.push({ $or: conditions.map(c => c.$or) })
  }
  
  if (typeFilter) {
    query.$and.push({ type: typeFilter })
  }
  
  if (sequenceFilter) {
    query.$and.push({ sequence: sequenceFilter })
  }
  
  // If no conditions, return empty (shouldn't happen but safety)
  if (query.$and.length === 0) {
    return {}
  }
  
  return query
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 100

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing search query', code: 400 }, { status: 400 })
    }

    const searchTerm = q.trim()
    const themeQuery = parseSearchQuery(searchTerm)

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