'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

export default function UserMePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/user/${user.username}`)
    } else if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  return null
}