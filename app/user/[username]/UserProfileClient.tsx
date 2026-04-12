'use client'

import { useUser } from '@/lib/api/users'
import { useFollow, useUnfollow, useFollowStatus } from '@/lib/api/follow'
import { useAuth } from '@/providers/AuthProvider'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { cn, formatCount } from '@/lib/utils'
import Link from 'next/link'

interface UserProfileClientProps {
  username: string
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const { user: currentUser } = useAuth()
  const { data: profileData, isLoading } = useUser(username)
  const { data: followData } = useFollowStatus(username)
  
  const follow = useFollow()
  const unfollow = useUnfollow()

  const profile = profileData?.data as any
  const isFollowing = (followData?.data as any)?.following ?? false

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex w-full">
        <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
          <div className="flex items-center gap-3 px-4 mb-8">
            <span className="text-accent text-2xl">≋</span>
            <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
          </div>
        </nav>
        <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
          <AppHeader />
          <div className="p-4"><LoadingSkeleton /></div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-base flex w-full">
        <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
          <div className="flex items-center gap-3 px-4 mb-8">
            <span className="text-accent text-2xl">≋</span>
            <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
          </div>
        </nav>
        <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
          <AppHeader />
          <div className="p-4">
            <EmptyState title="User not found" description="This user doesn't exist" />
          </div>
        </main>
        <BottomNav />
      </div>
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
    <div className="min-h-screen bg-bg-base flex w-full">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-accent text-2xl">≋</span>
          <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </div>
      </nav>
      
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
        <AppHeader />
        <div className="p-4 max-w-2xl mx-auto">
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

          <section className="mt-4">
            <h2 className="text-lg font-display font-bold text-ktext-primary mb-3">Recent Activity</h2>
            <div className="space-y-2">
              <p className="text-sm text-ktext-tertiary text-center py-4">
                No recent activity
              </p>
            </div>
          </section>
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}