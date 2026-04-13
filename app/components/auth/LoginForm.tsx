'use client'

import { useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { setAccessToken } from '@/lib/auth-client'
import { useAuth } from '@/providers/AuthProvider'

export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      setAccessToken(data.data.accessToken)
      
      // Set user immediately after login
      if (data.data.user) {
        setUser({
          id: data.data.user._id,
          username: data.data.user.username,
          displayName: data.data.user.username,
          avatarUrl: null,
        })
      }
      
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary mb-1.5 block">
          Email Address
        </label>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4 border border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <Mail className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@kaikansen.io"
            className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary placeholder:text-ktext-disabled"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary">
            Password
          </label>
          <button type="button" className="text-xs font-body text-accent interactive">
            Forgot?
          </button>
        </div>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4 border border-border-default focus-within:border-border-accent">
          <Lock className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="interactive rounded-full p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-ktext-tertiary" />
            ) : (
              <Eye className="w-4 h-4 text-ktext-tertiary" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-accent text-white rounded-full font-body font-semibold flex items-center justify-center gap-2 interactive hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="text-center text-sm font-body text-ktext-secondary mt-4">
        Don't have an account?{' '}
        <Link href="/register" className="text-accent font-semibold interactive">
          Create one
        </Link>
      </p>
    </form>
  )
}