'use client'

import { useThemeMode } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/app/components/shared/ThemeToggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { isDark, setTheme } = useThemeMode()
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Currently: {isDark ? 'Dark' : 'Light'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-muted-foreground">
                {user?.isPublic ? 'Your profile is visible to others' : 'Your profile is private'}
              </p>
            </div>
            <button className="btn btn-outline text-sm">Edit</button>
          </div>
        </div>

        <div className="card border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-red-400">Danger Zone</h2>
          <button
            onClick={async () => {
              await logout()
              router.push('/')
            }}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
