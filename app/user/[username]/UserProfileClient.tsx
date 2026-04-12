'use client'

import { useUser } from '@/lib/api/users'
import { useFollow, useUnfollow, useFollowStatus } from '@/lib/api/follow'
import { useFriendStatus, useSendFriendRequest } from '@/lib/api/friends'
import { useAuth } from '@/providers/AuthProvider'
import { useHistory } from '@/lib/api/history'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { HistoryCard } from '@/app/components/theme/HistoryCard'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
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
  const isOwnProfile = currentUser?.username === username
  
  const { data: friendData } = !isOwnProfile ? useFriendStatus(username) : { data: undefined }
  const sendFriendRequest = useSendFriendRequest()
  const friendStatus = (friendData?.data as any)?.status ?? 'none'
  const { data: historyData } = isOwnProfile && currentUser?.id ? useHistory(currentUser.id, undefined, 1) : { data: undefined }
  const recentActivity = (historyData?.data as any[] ?? []).slice(0, 5)

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
              <div className="flex gap-2">
                <button
                  onClick={handleFollowToggle}
                  disabled={follow.isPending || unfollow.isPending}
                  className={cn(
                    'px-4 h-11 font-body font-semibold rounded-full transition-colors',
                    isFollowing
                      ? 'bg-bg-elevated border border-border-default text-ktext-primary'
                      : 'bg-accent text-white'
                  )}
                >
                  {follow.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => sendFriendRequest.mutate(username)}
                  disabled={friendStatus !== 'none' || sendFriendRequest.isPending}
                  className={cn(
                    'px-4 h-11 font-body font-semibold rounded-full transition-colors flex items-center gap-1',
                    friendStatus === 'accepted'
                      ? 'bg-accent text-white'
                      : friendStatus === 'pending'
                      ? 'bg-bg-elevated border border-border-default text-ktext-secondary'
                      : 'bg-accent-container border border-border-accent text-accent'
                  )}
                >
                  {sendFriendRequest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : friendStatus === 'accepted' ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Friends
                    </>
                  ) : friendStatus === 'pending' ? (
                    'Pending'
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Add
                    </>
                  )}
                </button>
              </div>
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
              {recentActivity.length > 0 ? (
                recentActivity.map((item: any) => (
                  <HistoryCard key={item._id} item={item} />
                ))
              ) : (
                <p className="text-sm text-ktext-tertiary text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}