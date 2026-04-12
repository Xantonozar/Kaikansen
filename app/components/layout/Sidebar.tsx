'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Users, Music, Film, Clock, User, X } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/search', label: 'Search', Icon: Search },
  { path: '/friends', label: 'Friends', Icon: Users },
  { path: '/artists', label: 'Artists', Icon: Music },
  { path: '/anime', label: 'Anime', Icon: Film },
  { path: '/history', label: 'History', Icon: Clock },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Mobile Slide-in */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-72 bg-bg-surface border-r border-border-subtle z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:hidden"
      )}>
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full interactive"
        >
          <X className="w-5 h-5 text-ktext-secondary" />
        </button>

        {/* Logo */}
        <div className="p-4 pt-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-accent text-2xl">≋</span>
            <span className="font-display font-bold text-xl text-ktext-primary">Kaikansen</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path !== '/' && pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors",
                  isActive 
                    ? "bg-accent-mint-container text-accent" 
                    : "text-ktext-secondary hover:text-ktext-primary hover:bg-bg-elevated"
                )}
              >
                <item.Icon className="w-5 h-5" />
                <span className="font-body font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-subtle">
          <Link
            href={user ? "/user/me" : "/login"}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] hover:bg-bg-elevated transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-elevated border-2 border-accent-mint">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-2 text-ktext-tertiary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-ktext-primary truncate">
                {user?.displayName || 'Sign In'}
              </p>
              <p className="text-xs text-ktext-tertiary truncate">
                {user ? `@${user.username}` : 'Login to your account'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}