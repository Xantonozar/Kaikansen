'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

interface FollowButtonProps {
  username: string
}

export function FollowButton({ username }: FollowButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleToggle = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const res = await fetch(`/api/follow/${username}`, { method })
      const json = await res.json()
      if (json.success) {
        setIsFollowing(!isFollowing)
      }
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="px-8 h-11 bg-accent text-white rounded-full font-body font-semibold interactive hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow Artist
        </>
      )}
    </button>
  )
}