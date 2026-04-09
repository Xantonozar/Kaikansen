'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/api/themes'
import { useRating, useSetRating } from '@/lib/api/ratings'
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/lib/api/favorites'
import { useAddToHistory } from '@/lib/api/history'
import { RatingWidget } from '@/app/components/shared/RatingWidget'
import { WatchListenToggle } from '@/app/components/shared/WatchListenToggle'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <ThemePageContent slug={slug} />
}

function ThemePageContent({ slug }: { slug: string }) {
  const { user } = useAuth()
  const { data: themeData, isLoading } = useTheme(slug)
  const { data: ratingData } = useRating(user ? slug : '')
  const { data: favData } = useFavorites()
  const { mutate: setRating, isPending: isRatingPending } = useSetRating()
  const { mutate: addFavorite, isPending: isAddingFavorite } = useAddFavorite()
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite()
  const { mutate: addToHistory } = useAddToHistory()

  const theme = themeData?.data
  const userRating = ratingData?.data?.rating
  const isFavorite = (favData?.data as any[])?.some((fav: any) => fav.themeSlug === slug)

  if (isLoading) return <LoadingSkeleton />
  if (!theme) return <EmptyState title="Theme not found" />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {theme.animeCoverImage && (
          <div>
            <img
              src={theme.animeCoverImage}
              alt={theme.animeTitle}
              className="rounded-lg"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold">{theme.songTitle}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{theme.animeTitle}</p>

          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {theme.type}
            </span>
            {theme.year && (
              <span className="rounded-full bg-muted px-3 py-1 text-sm">
                {theme.year}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Artists</h3>
            <div className="flex flex-wrap gap-2">
              {theme.allArtists.map((artist) => (
                <Link
                  key={artist}
                  href={`/artist/${artist.toLowerCase().replace(/\s+/g, '-')}`}
                  className="rounded-full bg-primary/20 px-3 py-1 text-sm hover:bg-primary/30"
                >
                  {artist}
                </Link>
              ))}
            </div>
            <div className="flex gap-2">
              {theme.videoSources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  className="btn btn-outline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.resolution}p
                </a>
              ))}
            </div>
          </div>

          {user && (
            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <RatingWidget
                currentRating={userRating}
                onRate={async (rating) => {
                  setRating({ themeSlug: slug, rating })
                }}
                isLoading={isRatingPending}
              />

              <WatchListenToggle
                isFavorite={isFavorite}
                onToggle={async () => {
                  if (isFavorite) {
                    removeFavorite(slug)
                  } else {
                    addFavorite(slug)
                  }
                  addToHistory(slug)
                }}
                isLoading={isAddingFavorite || isRemovingFavorite}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
