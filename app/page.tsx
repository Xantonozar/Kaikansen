import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { FeaturedCard } from '@/app/components/home/FeaturedCard'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'

async function getFeaturedThemes() {
  await connectDB()
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  let season: string
  if (month < 3) season = 'WINTER'
  else if (month < 5) season = 'SPRING'
  else if (month < 8) season = 'SUMMER'
  else season = 'FALL'
  
  return ThemeCache.find({
    animeSeason: season,
    animeSeasonYear: year,
  })
    .sort({ avgRating: -1, totalRatings: -1 })
    .limit(10)
    .lean()
}

async function getPopularThemes() {
  await connectDB()
  return ThemeCache.find({})
    .sort({ avgRating: -1, totalRatings: -1 })
    .limit(20)
    .lean()
}

export default async function Home() {
  const [featuredThemes, popularThemes] = await Promise.all([
    getFeaturedThemes(),
    getPopularThemes(),
  ])
  
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  let seasonLabel = ''
  if (month < 3) seasonLabel = 'Winter'
  else if (month < 5) seasonLabel = 'Spring'
  else if (month < 8) seasonLabel = 'Summer'
  else seasonLabel = 'Fall'

  return (
    <div className="min-h-screen bg-bg-base flex">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60 bg-bg-surface border-r border-border-subtle z-40 py-4">
        <div className="flex items-center gap-3 px-4 mb-8">
          <span className="text-accent text-2xl">≋</span>
          <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
        </div>
      </nav>
      
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:pl-20 lg:pl-60 px-4 md:px-6 lg:px-8">
        <AppHeader />
        
        <div className="max-w-2xl mx-auto md:max-w-7xl space-y-6 pt-4">
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-body font-semibold text-accent uppercase tracking-wide">Current Season</p>
                <h2 className="text-2xl font-display font-bold text-ktext-primary">{seasonLabel} {year}</h2>
              </div>
              <a href={`/season/${seasonLabel.toLowerCase()}/${year}`} className="text-sm font-body text-accent font-semibold interactive">
                View All
              </a>
            </div>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {featuredThemes.map((theme: any) => (
                <FeaturedCard key={theme.slug} theme={theme} />
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-bold text-ktext-primary">🔥 Popular Themes</h2>
            </div>
            
            <div className="space-y-2">
              {popularThemes.slice(0, 10).map((theme: any) => (
                <ThemeListRow key={theme.slug} theme={theme} />
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <BottomNav />
    </div>
  )
}
