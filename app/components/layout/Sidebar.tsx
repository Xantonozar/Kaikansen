'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Users, Music, Film, Clock, User, X, Settings, LogOut } from 'lucide-react'
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
      {/* Backdrop with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-80 bg-bg-surface border-r border-border-subtle z-50 transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:hidden"
      )}>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-accent-container flex items-center justify-center">
              <span className="text-accent text-xl">≋</span>
            </div>
            <div>
              <p className="font-display font-bold text-lg text-ktext-primary">Kaikansen</p>
              <p className="text-xs text-ktext-tertiary">Anime OP/ED</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center interactive hover:bg-bg-hover"
          >
            <X className="w-5 h-5 text-ktext-secondary" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path !== '/' && pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all duration-200",
                  isActive 
                    ? "bg-accent-container text-accent shadow-sm" 
                    : "text-ktext-secondary hover:text-ktext-primary hover:bg-bg-elevated hover:translate-x-1"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isActive ? "bg-accent text-white" : "bg-bg-elevated"
                )}>
                  <item.Icon className="w-5 h-5" />
                </div>
                <span className="font-body font-semibold">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-accent" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-2 h-px bg-border-subtle" />

        {/* Quick Links */}
        <nav className="px-3 space-y-1">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-ktext-secondary hover:text-ktext-primary hover:bg-bg-elevated hover:translate-x-1 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-body font-semibold">Settings</span>
          </Link>
        </nav>

        {/* Profile Section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-subtle bg-bg-surface">
          <Link
            href={user ? "/user/me" : "/login"}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-bg-elevated transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg-elevated border-2 border-accent group-hover:border-accent">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-ktext-tertiary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-ktext-primary truncate">
                {user?.displayName || 'Guest'}
              </p>
              <p className="text-xs text-ktext-tertiary truncate">
                {user ? `@${user.username}` : 'Tap to login'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}