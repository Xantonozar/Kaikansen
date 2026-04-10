export const queryKeys = {
  themes: {
    popular: (type?: string) => ['themes', 'popular', type] as const,
    seasonal: (season: string, year: number, type?: string) => ['themes', 'seasonal', season, year, type] as const,
    bySlug: (slug: string) => ['themes', slug] as const,
    byArtist: (slug: string) => ['themes', 'artist', slug] as const,
  },
  search: {
    results: (q: string, by?: string, type?: string) => ['search', q, by, type] as const,
  },
  anime: {
    byId: (id: number) => ['anime', id] as const,
  },
  artist: {
    bySlug: (slug: string) => ['artist', slug] as const,
  },
  ratings: {
    mine: (themeSlug: string) => ['ratings', 'mine', themeSlug] as const,
  },
  favorites: {
    byUser: (userId: string) => ['favorites', userId] as const,
  },
  friends: {
    list: (userId: string) => ['friends', userId] as const,
    requests: (userId: string) => ['friends', 'requests', userId] as const,
    activity: (userId: string) => ['friends', 'activity', userId] as const,
  },
  follow: {
    status: (username: string) => ['follow', 'status', username] as const,
    followers: (username: string) => ['follow', 'followers', username] as const,
    following: (username: string) => ['follow', 'following', username] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'count', userId] as const,
  },
  profile: {
    byUsername: (username: string) => ['profile', username] as const,
  },
  stats: {
    live: () => ['stats', 'live'] as const,
  },
}