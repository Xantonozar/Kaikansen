'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ThemeFeaturedCard } from '@/app/components/theme/ThemeFeaturedCard'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { useAuth } from '@/providers/AuthProvider'
import { queryKeys } from '@/lib/queryKeys'

interface Theme {
  slug: string
  songTitle: string
  artistName?: string | null
  animeTitle: string
  animeCoverImage: string | null
  animeGrillImage?: string | null
  type: 'OP' | 'ED'
  sequence?: number
  avgRating: number
  totalRatings: number
}

interface HomeClientProps {
  popularThemes: Theme[]
  featuredThemes: Theme[]
  currentSeason: { season: string; year: number }
  stats: { activeUsers: number; listeningNow: number; avatars: string[] }
}

export function HomeClient({ popularThemes, featuredThemes, currentSeason, stats }: HomeClientProps) {
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState<'OP' | 'ED' | null>(null)

  const filteredThemes = typeFilter 
    ? popularThemes.filter(t => t.type === typeFilter)
    : popularThemes

  const { data: friendActivity } = useQuery({
    queryKey: queryKeys.friends.activity(user?.id || ''),
    queryFn: async () => {
      const res = await fetch('/api/friends/activity')
      const json = await res.json()
      return json.success ? json.data : []
    },
    enabled: !!user,
  })

  return (
    <div className="max-w-2xl mx-auto md:max-w-7xl space-y-6 pt-4">
      {/* Section: Featured (current season) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-body font-semibold text-accent uppercase tracking-wide">Current Season</p>
            <h2 className="text-2xl font-display font-bold text-ktext-primary">
              {currentSeason.season} {currentSeason.year}
            </h2>
          </div>
          <Link 
            href={`/season/${currentSeason.season.toLowerCase()}/${currentSeason.year}`}
            className="text-sm font-body text-accent font-semibold interactive"
          >
            View All
          </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {featuredThemes.slice(0, 10).map((theme) => (
            <ThemeFeaturedCard key={theme.slug} theme={theme} />
          ))}
        </div>
      </section>

      {/* Section: Friends Activity (logged in + has friends) */}
      {user && friendActivity && friendActivity.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-ktext-primary">👥 Friends Activity</h2>
            <Link href="/friends" className="text-sm font-body text-accent font-semibold interactive">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {friendActivity.slice(0, 5).map((activity: any, idx: number) => (
              <ThemeListRow 
                key={`${activity.username}-${activity.themeSlug}-${idx}`}
                theme={{
                  slug: activity.themeSlug,
                  songTitle: activity.theme?.songTitle || '',
                  animeTitle: activity.theme?.animeTitle || '',
                  animeCoverImage: activity.theme?.animeCoverImage || null,
                  type: activity.theme?.type || 'OP',
                  sequence: activity.theme?.sequence,
                  avgRating: activity.score || 0,
                  totalRatings: 0,
                }}
                friendUsername={activity.username}
                friendScore={activity.score}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section: Popular Themes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold text-ktext-primary">🔥 Popular Themes</h2>
          <div className="flex gap-1 p-1 bg-bg-elevated rounded-full">
            {(['OP', 'ED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={`h-7 px-3 rounded-full text-xs font-body font-bold transition-colors duration-150 interactive
                  ${typeFilter === t
                    ? 'bg-accent text-white'
                    : 'text-ktext-secondary hover:text-ktext-primary'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredThemes.slice(0, 10).map((theme) => (
            <ThemeListRow key={theme.slug} theme={theme} />
          ))}
        </div>
      </section>

      {/* Live Stats Footer */}
      <section className="flex gap-3 pt-4 border-t border-border-subtle">
        <div className="flex-1 bg-bg-surface rounded-[16px] p-4 border border-border-subtle">
          <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide">
            Active Users
          </p>
          <p className="text-2xl font-mono font-bold text-accent mt-1">
            {stats.activeUsers}
          </p>
        </div>
        <div className="flex-1 bg-bg-surface rounded-[16px] p-4 border border-border-subtle">
          <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide">
            Listening Now
          </p>
          <p className="text-2xl font-mono font-bold text-accent mt-1">
            {stats.listeningNow}
          </p>
          {stats.avatars && stats.avatars.length > 0 && (
            <div className="flex -space-x-2 mt-2">
              {stats.avatars.slice(0, 5).map((url, i) => (
                <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-bg-surface">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}