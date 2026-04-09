'use client'

import { UserPlus, UserCheck } from 'lucide-react'

interface FollowButtonProps {
  isFollowing?: boolean
  onToggle: () => Promise<void>
  isLoading?: boolean
}

export function FollowButton({
  isFollowing,
  onToggle,
  isLoading,
}: FollowButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
        isFollowing
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </button>
  )
}
