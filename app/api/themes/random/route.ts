export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const theme = await ThemeCache.aggregate([
      { $sample: { size: 1 } }
    ])

    if (!theme || theme.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No themes found', code: 404 },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: theme[0],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get random theme error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}