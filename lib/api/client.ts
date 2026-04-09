'use client'

import { getAccessToken, setAccessToken, refreshAccessToken } from '@/lib/auth-client'
import { ApiResponse } from '@/types/api.types'

async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<ApiResponse<T>> {
  const { skipAuth, ...fetchOptions } = options || {}

  const headers = new Headers(fetchOptions.headers || {})

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  })

  // Handle 401 - try to refresh token and retry once
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const newHeaders = new Headers(headers)
      newHeaders.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(url, {
        ...fetchOptions,
        headers: newHeaders,
        credentials: 'include',
      })
    }
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

export { fetchWithAuth }
