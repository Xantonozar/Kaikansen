import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { HomeClient } from '@/app/components/home/HomeClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function getCurrentSeason() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  if (month < 3) return { season: 'WINTER', label: 'Winter' }
  if (month < 5) return { season: 'SPRING', label: 'Spring' }
  if (month < 8) return { season: 'SUMMER', label: 'Summer' }
  return { season: 'FALL', label: 'Fall' }
}

async function getPopularThemes() {
  try {
    const res = await fetch(`${APP_URL}/api/themes/popular?page=1`, { cache: 'no-store' })
    const json = await res.json()
    return json.success ? json.data : []
  } catch {
    return []
  }
}

async function getSeasonalThemes(season: string, year: number) {
  try {
    const res = await fetch(`${APP_URL}/api/themes/seasonal?season=${season}&year=${year}&page=1`, { cache: 'no-store' })
    const json = await res.json()
    return json.success ? json.data : []
  } catch {
    return []
  }
}

async function getLiveStats() {
  try {
    const res = await fetch(`${APP_URL}/api/stats/live`, { cache: 'no-store' })
    const json = await res.json()
    return json.success ? json.data : { activeUsers: 0, listeningNow: 0, avatars: [] }
  } catch {
    return { activeUsers: 0, listeningNow: 0, avatars: [] }
  }
}

export default async function Home() {
  const { season, label } = getCurrentSeason()
  const year = new Date().getFullYear()
  
  const [popularThemes, featuredThemes, stats] = await Promise.all([
    getPopularThemes(),
    getSeasonalThemes(season, year),
    getLiveStats(),
  ])

  return (
    <div className="min-h-screen bg-bg-base flex w-full">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-accent text-2xl">≋</span>
          <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </div>
      </nav>
      
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 w-full">
        <AppHeader />
        
        <div className="px-4 md:px-6 lg:px-8">
          <HomeClient 
            popularThemes={popularThemes}
            featuredThemes={featuredThemes}
            currentSeason={{ season: label, year }}
            stats={stats}
          />
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}