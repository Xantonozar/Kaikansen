'use client'

import { ReactNode, useEffect } from 'react'
import { refreshAccessToken } from '@/lib/auth-client'

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Attempt silent refresh on mount
    refreshAccessToken()
  }, [])

  return <>{children}</>
}
