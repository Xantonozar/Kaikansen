'use client'

import { useState, useCallback, useEffect } from 'react'
import { getAccessToken, setAccessToken, logout as clientLogout } from '@/lib/auth-client'
import { User } from '@/types/app.types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const token = getAccessToken()
        if (token) {
          const response = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const data = await response.json()
            setUser(data.data)
          }
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      setAccessToken(data.data.accessToken)
      setUser(data.data.user)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await clientLogout()
    setUser(null)
  }, [])

  return { user, isLoading, login, logout }
}