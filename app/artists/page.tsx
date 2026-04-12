'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/app/components/layout/AppHeader'
import { BottomNav } from '@/app/components/layout/BottomNav'
import { LoadingSkeleton } from '@/app/components/shared/LoadingSkeleton'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { useArtists } from '@/lib/api/artist'
import { Search } from 'lucide-react'

export default function ArtistsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useArtists(page, search)
  const artists = (data?.data ?? []) as any[]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-bg-base flex w-full">
      <main className="flex-1 min-w-0 pb-20 md:pb-0 w-full">
        <AppHeader />
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-display font-bold mb-4">Artists</h1>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ktext-tertiary" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search artists..."
              className="w-full pl-10 pr-4 py-3 bg-bg-surface border border-border-subtle rounded-[16px] text-ktext-primary placeholder:text-ktext-tertiary focus:outline-none focus:border-accent"
            />
          </form>

          {/* Artists Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <LoadingSkeleton count={12} />
            </div>
          ) : artists.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((artist: any) => (
                  <Link
                    key={artist._id}
                    href={`/artist/${artist.slug}`}
                    className="bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card hover:border-accent transition-colors"
                  >
                    <div className="w-full aspect-square rounded-[12px] overflow-hidden bg-bg-elevated mb-3">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ktext-tertiary">
                          <span className="text-2xl">🎵</span>
                        </div>
                      )}
                    </div>
                    <p className="font-body font-semibold text-ktext-primary truncate">{artist.name}</p>
                    <p className="text-xs text-ktext-tertiary">{artist.totalThemes || 0} themes</p>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data?.meta?.hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2 bg-bg-surface border border-border-subtle rounded-full text-sm font-semibold text-ktext-secondary hover:text-ktext-primary hover:border-accent transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              title={search ? "No artists found" : "No artists yet"} 
              description={search ? "Try a different search term" : "Artists will appear here"} 
            />
          )}
        </div>
        <BottomNav />
      </main>
    </div>
  )
}