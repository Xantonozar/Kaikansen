'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeCard } from '@/app/components/theme/ThemeCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useThemesSeasonal } from '@/lib/api/themes'

const SEASONS = ['winter', 'spring', 'summer', 'fall']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i)

export default function SeasonPage() {
  const params = useParams()
  const season = (params.season as string)?.toUpperCase()
  const year = parseInt(params.year as string)
  const [typeFilter, setTypeFilter] = useState<'OP' | 'ED' | null>(null)

  const isValidSeason = SEASONS.map(s => s.toUpperCase()).includes(season)
  const isValidYear = YEARS.includes(year)

  const { data, isLoading } = useThemesSeasonal(season.toLowerCase(), year, typeFilter || undefined, 1)
  const themes = (data?.data ?? []) as any[]

  if (!isValidSeason || !isValidYear) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Invalid season or year"
            description="Please select a valid season (winter, spring, summer, fall) and year."
          />
        </main>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <LoadingSkeleton count={12} />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-4 capitalize">
          {season?.toLowerCase()} {year}
        </h1>

        <div className="flex gap-1 p-1 bg-bg-elevated rounded-full mb-6 w-fit">
          {(['OP', 'ED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`h-8 px-4 rounded-full text-sm font-body font-bold transition-colors duration-150 interactive
                ${typeFilter === t
                  ? 'bg-accent text-white'
                  : 'text-ktext-secondary hover:text-ktext-primary'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {themes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme: any) => (
              <ThemeCard key={theme.slug} theme={theme} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No themes"
            description={`No anime themes found for ${season?.toLowerCase()} ${year}.`}
          />
        )}
      </main>
    </>
  )
}