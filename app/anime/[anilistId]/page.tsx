'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeCard } from '@/app/components/theme/ThemeCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { useAnimeThemes } from '@/lib/api/themes'

export default function AnimePage() {
  const params = useParams()
  const anilistId = parseInt(params.anilistId as string)

  const { data, isLoading } = useAnimeThemes(anilistId)
  const anime = data?.data as any
  const themes = anime?.themes ?? []

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
          <h1 className="text-3xl font-display font-bold mb-2">{anime?.titleRomaji}</h1>
          <p className="text-sm text-ktext-secondary">
            AniList ID: {anilistId}
          </p>
        </div>

        <section>
          <h2 className="text-xl font-display font-semibold mb-4">Opening & Ending Themes</h2>
          {themes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme: any) => (
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