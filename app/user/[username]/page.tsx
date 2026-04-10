'use client'

import { useUser, useUpdateProfile } from '@/lib/api/users'
import { useFollow, useUnfollow, useFollowStatus } from '@/lib/api/follow'
import { useAuth } from '@/providers/AuthProvider'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useState } from 'react'
import { cn, formatCount } from '@/lib/utils'
import Link from 'next/link'

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  return <UserProfileContent params={params} />
}

async function UserProfileContent({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const { user: currentUser } = useAuth()
  const { data: profileData, isLoading } = useUser(username)
  const { data: followData } = useFollowStatus(username)
  
  const follow = useFollow()
  const unfollow = useUnfollow()

  const profile = profileData?.data as any
  const isFollowing = (followData?.data as any)?.following ?? false

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4"><LoadingSkeleton /></main>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState title="User not found" description="This user doesn't exist" />
        </main>
      </>
    )
  }

  const isOwnProfile = currentUser?.username === username

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollow.mutate(username)
    } else {
      follow.mutate(username)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center pt-6 pb-4 space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent-mint ring-offset-2 ring-offset-bg-base">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ktext-tertiary text-3xl">
                  {profile.displayName?.[0] ?? '?'}
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-display font-bold text-ktext-primary">{profile.displayName}</h1>
            <p className="text-sm font-body text-ktext-secondary mt-1">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm font-body text-ktext-tertiary mt-2 max-w-[240px]">{profile.bio}</p>
            )}
          </div>

          {isOwnProfile ? (
            <button className="px-8 h-11 bg-accent-container border border-border-accent text-accent font-body font-semibold rounded-full">
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={follow.isPending || unfollow.isPending}
              className={cn(
                'px-8 h-11 font-body font-semibold rounded-full transition-colors',
                isFollowing
                  ? 'bg-bg-elevated border border-border-default text-ktext-primary'
                  : 'bg-accent text-white'
              )}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <div className="flex gap-3 w-full max-w-xs">
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-display font-bold text-accent">{formatCount(profile.totalRatings ?? 0)}</p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">RATINGS</p>
            </div>
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-display font-bold text-accent">{formatCount(profile.totalFollowing ?? 0)}</p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">FOLLOWING</p>
            </div>
            <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
              <p className="text-xl font-display font-bold text-accent">{formatCount(profile.totalFollowers ?? 0)}</p>
              <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">FOLLOWERS</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}