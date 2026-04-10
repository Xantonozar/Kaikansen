'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems: Array<{ path: string; label: string; Icon: any; badge?: number }> = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/search', label: 'Search', Icon: Search },
  { path: '/notifications', label: 'Alerts', Icon: Bell, badge: 0 },
  { path: '/user/me', label: 'Profile', Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-subtle h-16 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 relative interactive',
              isActive ? 'text-accent' : 'text-ktext-tertiary'
            )}
          >
            {isActive && (
              <span className="absolute inset-x-auto w-14 h-9 rounded-full bg-accent-mint-container" />
            )}
            <item.Icon className="w-6 h-6 relative z-10" />
            <span className="text-[10px] font-body">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-2 right-1/4 min-w-[16px] h-4 bg-error text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center px-1">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}