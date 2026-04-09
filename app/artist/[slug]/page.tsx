'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { ThemeListRow } from '@/app/components/theme/ThemeListRow'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { getArtist } from '@/lib/api/artist'

export default function ArtistPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: artist, isLoading } = useQuery(getArtist(slug)) as {
    data: any
    isLoading: boolean
  }

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="p-4 space-y-4">
          <LoadingSkeleton count={5} />
        </main>
      </>
    )
  }

  if (!artist) {
    return (
      <>
        <AppHeader />
        <main className="p-4">
          <EmptyState
            title="Artist not found"
            description="This artist doesn't exist or has been removed."
          />
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="p-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
          {artist.description && (
            <p className="text-gray-600 dark:text-gray-400">{artist.description}</p>
          )}
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Themes</h2>
          {artist.themes && artist.themes.length > 0 ? (
            <div className="space-y-2">
              {artist.themes.map((theme: any) => (
                <ThemeListRow key={theme.slug} theme={theme} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No themes"
              description="This artist hasn't sung any themes yet."
            />
          )}
        </section>
      </main>
    </>
  )
}
