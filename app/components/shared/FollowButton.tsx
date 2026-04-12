'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useFollow, useUnfollow, useFollowStatus } from '@/lib/api/follow'
import { useToast } from '@/app/components/shared/Toast'

interface FollowButtonProps {
  username: string
  size?: 'sm' | 'md' | 'lg'
}

export function FollowButton({ username, size = 'md' }: FollowButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data: statusData, isLoading: statusLoading } = useFollowStatus(username)
  const follow = useFollow()
  const unfollow = useUnfollow()

  const isFollowing = (statusData?.data as any)?.following ?? false

  useEffect(() => {
    if (follow.isError) {
      const err = follow.error as any
      showToast(err?.message || 'Failed to follow user', 'error')
    }
    if (unfollow.isError) {
      const err = unfollow.error as any
      showToast(err?.message || 'Failed to unfollow user', 'error')
    }
  }, [follow.isError, unfollow.isError])

  const isLoading = statusLoading || follow.isPending || unfollow.isPending

  const handleToggle = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (isFollowing) {
      unfollow.mutate(username)
    } else {
      follow.mutate(username)
    }
  }

  const sizeClasses = {
    sm: 'px-3 h-8 text-xs',
    md: 'px-5 h-10 text-sm',
    lg: 'px-8 h-12 text-base',
  }

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} bg-accent text-white rounded-full font-body font-semibold interactive hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isFollowing ? (
        <>
          <UserCheck className={iconSize} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className={iconSize} />
          <span>Follow</span>
        </>
      )}
    </button>
  )
}