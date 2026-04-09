import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ArtistCache } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params

    const artist = await ArtistCache.findOne({ slug }).lean()

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found', code: 404 },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: artist,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get artist error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
