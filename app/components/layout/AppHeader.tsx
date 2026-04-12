'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useThemeMode } from '@/hooks/useTheme'
import { Sidebar } from './Sidebar'
import { useSidebar } from './SidebarProvider'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { user } = useAuth()
  const { isDark } = useThemeMode()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useSidebar()
  
  const isHomePage = pathname === '/'
  const isSearchPage = pathname === '/search'
  const showBackButton = !isHomePage

  return (
    <>
      <Sidebar isOpen={isOpen} onClose={toggle} />
      <header className={cn(
        "sticky top-0 z-40 border-b border-border-subtle px-4 h-14 flex items-center justify-between w-full",
        isDark 
          ? "bg-bg-header rounded-b-[24px] shadow-md" 
          : "bg-bg-surface"
      )}>
      {showBackButton ? (
        <button 
          onClick={() => router.back()} 
          className="interactive rounded-full p-2"
        >
          <ArrowLeft className="w-5 h-5 text-ktext-secondary" />
        </button>
      ) : (
        <button onClick={toggle} className="interactive rounded-full p-2">
          <Menu className="w-5 h-5 text-ktext-secondary" />
        </button>
      )}

      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 interactive rounded-full px-2 py-1">
          <span className="text-accent text-xl">≋</span>
          <span className="font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {!isSearchPage && (
          <Link href="/search" className="interactive rounded-full p-2">
            <Search className="w-5 h-5" />
          </Link>
        )}
        <Link 
          href={user ? "/user/me" : "/login"} 
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent-mint bg-bg-elevated"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-elevated" />
          )}
        </Link>
      </div>
    </header>
    </>
  )
}
