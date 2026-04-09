'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/app/components/shared/ThemeToggle'

export function AppHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold">
          🎵 Kaikansen
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/search"
                className="text-sm hover:text-primary transition-colors"
              >
                Search
              </Link>
              <Link
                href="/user/profile"
                className="text-sm hover:text-primary transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/notifications"
                className="text-sm hover:text-primary transition-colors"
              >
                Notifications
              </Link>
              <button
                onClick={async () => {
                  await logout()
                  router.push('/')
                }}
                className="text-sm hover:text-primary transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary text-sm">
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
