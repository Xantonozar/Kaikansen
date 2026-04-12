'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function UserMePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready || authLoading) return
    
    if (user) {
      router.replace(`/user/${user.username}`)
    } else {
      router.replace('/login')
    }
  }, [user, authLoading, router, ready])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <LoadingSkeleton count={1} />
    </div>
  )
}