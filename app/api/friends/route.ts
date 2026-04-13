export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Notification } from '@/lib/models'
import { verifyAccessToken } from '@/lib/auth'
import { Types } from 'mongoose'

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
    const checkUsername = url.searchParams.get('check')
    const requestUsername = url.searchParams.get('request')
    
    const currentUserId = new Types.ObjectId(payload.userId)

    // Check friendship status
    if (checkUsername) {
      const targetUser = await User.findOne({ username: checkUsername }).lean()
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      
      const targetId = targetUser._id
      const currentUser = await User.findById(currentUserId).lean()
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }

      let status = 'none'
      if (currentUser.friends?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'accepted'
      } else if (currentUser.pendingRequests?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'pending'
      } else if (currentUser.sentRequests?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'sent'
      }
      return NextResponse.json({ success: true, data: { status } }, { status: 200 })
    }
    
    // Send friend request
    if (requestUsername) {
      const targetUser = await User.findOne({ username: requestUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      if (targetUser._id.toString() === payload.userId) {
        return NextResponse.json({ success: false, error: 'Cannot add yourself', code: 400 }, { status: 400 })
      }

      const currentUser = await User.findById(currentUserId)
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }

      // Check existing relationship
      const isFriend = currentUser.friends?.some((id: Types.ObjectId) => id.equals(targetUser._id))
      const hasPending = currentUser.pendingRequests?.some((id: Types.ObjectId) => id.equals(targetUser._id))
      const hasSent = currentUser.sentRequests?.some((id: Types.ObjectId) => id.equals(targetUser._id))

      if (isFriend) {
        return NextResponse.json({ success: false, error: 'Already friends', code: 409 }, { status: 409 })
      }
      if (hasPending || hasSent) {
        return NextResponse.json({ success: false, error: 'Request pending', code: 409 }, { status: 409 })
      }

      // Add to both users' arrays
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $addToSet: { sentRequests: targetUser._id } }
        ),
        User.updateOne(
          { _id: targetUser._id },
          { $addToSet: { pendingRequests: currentUserId } }
        ),
      ])

      await Notification.create({
        userId: targetUser._id,
        type: 'friend_request',
        fromUserId: currentUserId,
      })

      return NextResponse.json({ success: true, data: { status: 'pending' } }, { status: 201 })
    }
    
    // Get list of friends
    const currentUser = await User.findById(currentUserId)
      .populate('friends', 'username displayName avatarUrl bio')
      .lean()

    const friends = currentUser?.friends ?? []
    const total = friends.length

    return NextResponse.json(
      {
        success: true,
        data: friends,
        meta: { total },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}

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

    const url = new URL(request.url)
    const checkUsername = url.searchParams.get('check')
    const requestUsername = url.searchParams.get('request')
    
    const currentUserId = new Types.ObjectId(payload.userId)

    // Check friendship status
    if (checkUsername) {
      const targetUser = await User.findOne({ username: checkUsername }).lean()
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      
      const targetId = targetUser._id
      const currentUser = await User.findById(currentUserId).lean()
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }

      let status = 'none'
      if (currentUser.friends?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'accepted'
      } else if (currentUser.pendingRequests?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'pending'
      } else if (currentUser.sentRequests?.some((id: Types.ObjectId) => id.equals(targetId))) {
        status = 'sent'
      }
      return NextResponse.json({ success: true, data: { status } }, { status: 200 })
    }
    
    // Send friend request
    if (requestUsername) {
      const targetUser = await User.findOne({ username: requestUsername })
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }
      if (targetUser._id.toString() === payload.userId) {
        return NextResponse.json({ success: false, error: 'Cannot add yourself', code: 400 }, { status: 400 })
      }

      const currentUser = await User.findById(currentUserId)
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found', code: 404 }, { status: 404 })
      }

      // Check existing relationship
      const isFriend = currentUser.friends?.some((id: Types.ObjectId) => id.equals(targetUser._id))
      const hasPending = currentUser.pendingRequests?.some((id: Types.ObjectId) => id.equals(targetUser._id))
      const hasSent = currentUser.sentRequests?.some((id: Types.ObjectId) => id.equals(targetUser._id))

      if (isFriend) {
        return NextResponse.json({ success: false, error: 'Already friends', code: 409 }, { status: 409 })
      }
      if (hasPending || hasSent) {
        return NextResponse.json({ success: false, error: 'Request pending', code: 409 }, { status: 409 })
      }

      // Add to both users' arrays
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $addToSet: { sentRequests: targetUser._id } }
        ),
        User.updateOne(
          { _id: targetUser._id },
          { $addToSet: { pendingRequests: currentUserId } }
        ),
      ])

      await Notification.create({
        userId: targetUser._id,
        type: 'friend_request',
        fromUserId: currentUserId,
      })

      return NextResponse.json({ success: true, data: { status: 'pending' } }, { status: 201 })
    }
    
    return NextResponse.json({ success: false, error: 'Missing check or request parameter', code: 400 }, { status: 400 })
  } catch (error) {
    console.error('Send friend request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 500 },
      { status: 500 }
    )
  }
}