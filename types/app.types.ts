export interface Theme {
  themeId: number
  slug: string
  songTitle: string
  type: 'OP' | 'ED'
  sequence?: number
  year?: number
  season?: string
  anilistId?: number
  animeTitle?: string
  animeTitleEnglish?: string
  animeTitleAlternative?: string
  animeCoverImage?: string
  videoSources: { resolution: number; url: string }[]
  artistSlugs: string[]
  allArtists: string[]
  artistRoles: { name: string; role: string }[]
}

export interface Anime {
  anilistId: number
  title?: string
  titleAlternative?: string
  description?: string
  year?: number
  season?: string
  coverImage?: string
  bannerImage?: string
  status?: string
  episodeCount?: number
  averageScore?: number
  popularity?: number
  genres: string[]
}

export interface Artist {
  slug: string
  name: string
  image?: string
  members: string[]
}

export interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  isPublic: boolean
  createdAt: string
  friends?: string[]
  pendingRequests?: string[]
  sentRequests?: string[]
}

export interface Rating {
  _id: string
  userId: string
  themeSlug: string
  rating: number
  createdAt: string
}

export interface Notification {
  _id: string
  userId: string
  type: 'friend_request' | 'friend_accepted' | 'followed' | 'rating'
  fromUserId?: string
  relatedThemeSlug?: string
  isRead: boolean
  createdAt: string
}
