'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { refreshAccessToken, setAccessToken, logout as clientLogout, getAccessToken } from '@/lib/auth-client'

interface AuthUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.data) setUser(data.data)
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
    } else {
      refreshAccessToken()
        .then((token) => {
          if (!token) {
            setIsLoading(false)
            return
          }
          return fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json())
        })
        .then((data) => {
          if (data?.data) setUser(data.data)
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
    }
  }, [])

  const logout = async () => {
    await clientLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}