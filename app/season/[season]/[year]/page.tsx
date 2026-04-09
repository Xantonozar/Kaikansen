'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeCard } from '@/app/components/theme/ThemeCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { getThemesBySeason } from '@/lib/api/themes'

const SEASONS = ['winter', 'spring', 'summer', 'fall']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i)

export default function SeasonPage() {
  const params = useParams()
  const season = (params.season as string)?.toLowerCase()
  const year = parseInt(params.year as string)

  const isValidSeason = SEASONS.includes(season)
  const isValidYear = YEARS.includes(year)

  const { data: response, isLoading } = useQuery({
    ...getThemesBySeason(season, year),
    enabled: isValidSeason && isValidYear,
  }) as any
  const themes = (response || []) as any[]

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
        <h1 className="text-3xl font-bold mb-8 capitalize">
          {season} {year}
        </h1>

        {themes && themes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme: any) => (
              <ThemeCard key={theme.slug} theme={theme} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No themes"
            description={`No anime themes found for ${season} ${year}.`}
          />
        )}
      </main>
    </>
  )
}
