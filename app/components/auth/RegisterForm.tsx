'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { setAccessToken } from '@/lib/auth-client'

export function RegisterForm() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      const data = await response.json()
      setAccessToken(data.data.accessToken)
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
          Display Name
        </label>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4 border border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <User className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary placeholder:text-ktext-disabled"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary mb-1.5 block">
          Username
        </label>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4 border border-border-default focus-within:border-border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <span className="text-ktext-tertiary flex-shrink-0 text-sm font-body">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="username"
            className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary placeholder:text-ktext-disabled"
            required
          />
        </div>
      </div>

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
        <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary mb-1.5 block">
          Password
        </label>
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
        {isLoading ? 'Creating account...' : 'Begin Journey'}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="text-center text-sm font-body text-ktext-secondary mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-accent font-semibold interactive">
          Sign in
        </Link>
      </p>
    </form>
  )
}