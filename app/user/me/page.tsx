'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'

export default function UserMePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || authLoading) return
    
    if (user) {
      router.replace(`/user/${user.username}`)
    } else {
      router.replace('/login')
    }
  }, [user, authLoading, router, mounted])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <LoadingSkeleton count={1} />
    </div>
  )
}