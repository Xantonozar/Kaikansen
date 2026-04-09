'use client'

import { useUser } from '@/lib/api/users'
import { useFollow, useUnfollow } from '@/lib/api/follow'
import { FollowButton } from '@/app/components/shared/FollowButton'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export default function UserProfilePage({
  params: { username },
}: {
  params: Promise<{ username: string }>
}) {
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(null)

  if (!resolvedUsername) {
    params.then(({ username }) => setResolvedUsername(username))
    return <LoadingSkeleton />
  }

  const { user: currentUser } = useAuth()
  const { data: profileData, isLoading } = useUser(resolvedUsername)
  const { mutate: follow, isPending: isFollowing } = useFollow(resolvedUsername)
  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollow(resolvedUsername)

  const profile = profileData?.data

  if (isLoading) return <LoadingSkeleton />
  if (!profile) return <EmptyState title="User not found" />

  const isOwnProfile = currentUser?.username === resolvedUsername

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="card p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            {profile.bio && <p className="mt-2 text-muted-foreground">{profile.bio}</p>}
          </div>

          {!isOwnProfile && (
            <FollowButton
              isFollowing={false}
              onToggle={async () => {
                // Toggle follow
              }}
              isLoading={isFollowing || isUnfollowing}
            />
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Ratings</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  )
}
