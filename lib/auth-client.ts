'use client'

import { TokenPayload } from './auth'

const TOKEN_KEY = 'kaikansen_access_token'

let _accessToken: string | null = null

// Initialize token from localStorage on load
if (typeof window !== 'undefined') {
  _accessToken = localStorage.getItem(TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return _accessToken
}

export function setAccessToken(token: string | null): void {
  _accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null
    const { data } = await res.json()
    if (data?.accessToken) {
      setAccessToken(data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await fetch(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      })
    }
  }

  return res
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.success) setAccessToken(data.data.accessToken)
  return data
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  setAccessToken(null)
}