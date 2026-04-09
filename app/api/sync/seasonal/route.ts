export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check CRON_SECRET
    const cronSecret = request.headers.get('authorization')
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    await connectDB()

    // TODO: Implement seasonal sync logic
    // This would fetch new seasonal data from AnimeThemes API
    // and update existing records in MongoDB

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Seasonal sync scheduled',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
