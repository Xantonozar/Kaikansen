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

    const skip = (params.page - 1) * params.limit

    const [themes, artists] = await Promise.all([
      ThemeCache.find({ $text: { $search: params.q } })
        .limit(20)
        .lean(),
      ArtistCache.find({ $text: { $search: params.q } })
        .limit(10)
        .lean(),
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
