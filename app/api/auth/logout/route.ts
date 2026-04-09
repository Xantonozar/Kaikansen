import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, data: { message: 'Logged out' } },
    { status: 200 }
  )

  response.cookies.delete('refresh_token')
  return response
}
