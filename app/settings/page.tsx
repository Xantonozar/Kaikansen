'use client'

import { useTheme } from 'next-themes'
import { useAuth } from '@/providers/AuthProvider'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push('/')
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8">Settings</h1>

        <div className="space-y-4">
          <div className="bg-bg-surface rounded-[20px] border border-border-subtle p-6 shadow-card">
            <h2 className="text-lg font-display font-semibold text-ktext-primary mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-ktext-primary">Theme</p>
                <p className="text-sm text-ktext-tertiary">
                  Currently: {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
                </p>
              </div>
              <div className="flex gap-2 p-1 bg-bg-elevated rounded-full">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                      theme === t
                        ? 'bg-accent text-white'
                        : 'text-ktext-secondary'
                    )}
                  >
                    {t === 'light' && '☀️'}
                    {t === 'dark' && '🌙'}
                    {t === 'system' && '💻'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user && (
            <div className="bg-bg-surface rounded-[20px] border border-border-subtle p-6 shadow-card">
              <h2 className="text-lg font-display font-semibold text-ktext-primary mb-4">Account</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-accent-mint bg-bg-elevated">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ktext-tertiary text-xl">
                        {user.displayName?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-ktext-primary">{user.displayName}</p>
                    <p className="text-sm text-ktext-tertiary">@{user.username}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full h-14 rounded-full font-body font-bold text-white flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--logout-bg)' }}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout from Kaikansen'}
          </button>
        </div>

        <p className="text-center text-xs text-ktext-disabled mt-8 tracking-widest">
          VERSION 1.0.0
        </p>
      </main>
    </>
  )
}