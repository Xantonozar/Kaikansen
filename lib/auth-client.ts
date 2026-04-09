'use client'

import { TokenPayload } from './auth'

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      setAccessToken(null)
      return null
    }

    const data = await response.json()
    const newToken = data.data?.accessToken
    if (newToken) {
      setAccessToken(newToken)
      return newToken
    }
    return null
  } catch {
    setAccessToken(null)
    return null
  }
}

export async function logout(): Promise<void> {
  setAccessToken(null)
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // ignore
  }
}
