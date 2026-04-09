import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Rating } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { z } from 'zod'

const ratingSchema = z.object({
  themeSlug: z.string().min(1),
  rating: z.number().min(1).max(10),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { themeSlug, rating } = ratingSchema.parse(body)

    const existingRating = await Rating.findOne({
      userId: payload.userId,
      themeSlug,
    })

    if (existingRating) {
      existingRating.rating = rating
      await existingRating.save()
      return NextResponse.json(
        { success: true, data: existingRating.toObject() },
        { status: 200 }
      )
    }

    const newRating = new Rating({
      userId: payload.userId,
      themeSlug,
      rating,
    })

    await newRating.save()

    return NextResponse.json(
      { success: true, data: newRating.toObject() },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 400 },
        { status: 400 }
      )
    }

    console.error('Rating error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 401 },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = 50
    const skip = (page - 1) * limit

    const [ratings, total] = await Promise.all([
      Rating.find({ userId: payload.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Rating.countDocuments({ userId: payload.userId }),
    ])

    return NextResponse.json(
      {
        success: true,
        data: ratings,
        meta: {
          page,
          total,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}
