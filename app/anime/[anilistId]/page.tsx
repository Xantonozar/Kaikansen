'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeCard } from '@/app/components/theme/ThemeCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { getAnimeThemes } from '@/lib/api/themes'

export default function AnimePage() {
  const params = useParams()
  const anilistId = parseInt(params.anilistId as string)

  const { data: anime, isLoading } = useQuery(getAnimeThemes(anilistId)) as {
    data: any
    isLoading: boolean
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

  if (!anime) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Anime not found"
            description="This anime doesn't exist or has no themes."
          />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
          {anime.themes && anime.themes.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              AniList ID: {anilistId}
            </p>
          )}
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Opening & Ending Themes</h2>
          {anime.themes && anime.themes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anime.themes.map((theme: any) => (
                <ThemeCard key={theme.slug} theme={theme} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No themes"
              description="This anime has no opening or ending themes."
            />
          )}
        </section>
      </main>
    </>
  )
}
