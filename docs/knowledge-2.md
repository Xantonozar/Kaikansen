# Kaikansen — knowledge.md
> Everything an AI agent needs to know about internals.
> **v6 — Pure Next.js 16. MongoDB Atlas. Seed Script. Manual JWT. AnimeThemes Primary. AniList Fallback.**
> Read this before writing any code.

---

## 1. MENTAL MODEL

Kaikansen is about **OP/ED themes**, not anime.

```
PRIMARY DATA SOURCE (seed time only — run ONCE before first deploy):
  AnimeThemes API → ALL themes + artists + images + seasons

FALLBACK (seed time only, when AT missing data):
  AniList API → season, year, alternative names, cover image

LIVE APP (deploy → forever):
  ALL queries → MongoDB Atlas only
  ZERO calls to AnimeThemes or AniList from live app
  MongoDB Atlas is a cloud DB — data persists between deploys
```

### What we store per theme:
- Song title
- Every artist / singer / band name (all roles)
- Artist slugs (for artist pages)
- Anime name (display only — from AnimeThemes)
- Season + year (from AnimeThemes, or AniList fallback)
- All video resolutions (480p / 720p / 1080p)
- Anime cover + grill images (from AnimeThemes CDN)

---

## 2. MONGODB SCHEMAS

### `users` — `User.model.ts`
```typescript
const UserSchema = new Schema({
  username:       { type: String, required: true, unique: true, trim: true, lowercase: true },
  displayName:    { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  passwordHash:   { type: String, required: true },   // bcryptjs hash, 12 rounds
  avatarUrl:      { type: String, default: null },
  bio:            { type: String, default: '', maxlength: 200 },
  totalRatings:   { type: Number, default: 0 },
  totalFollowers: { type: Number, default: 0 },
  totalFollowing: { type: Number, default: 0 },
  isPublic:       { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
```

### `themecaches` — `ThemeCache.model.ts` (PRIMARY COLLECTION)
```typescript
const ThemeCacheSchema = new Schema({
  // Identifiers
  slug:              { type: String, required: true, unique: true },  // "snk-op1"
  animethemesId:     { type: Number, required: true, unique: true },

  // Song info — the main content
  songTitle:         { type: String, required: true },
  artistName:        { type: String, default: null },
  allArtists:        [{ type: String }],
  artistSlugs:       [{ type: String }],
  artistRoles:       [{ type: String }],

  // Anime info (display only — denormalised from AnimeCache)
  anilistId:         { type: Number, default: null },
  animeTitle:        { type: String, required: true },
  animeTitleEnglish: { type: String, default: null },
  animeTitleAlternative: [{ type: String }],
  animeSeason:       { type: String, enum: ['WINTER','SPRING','SUMMER','FALL', null], default: null },
  animeSeasonYear:   { type: Number, default: null },

  // Images from AnimeThemes CDN (primary) — AniList fallback
  animeCoverImage:   { type: String, default: null },
  animeGrillImage:   { type: String, default: null },

  // Theme metadata
  type:              { type: String, enum: ['OP', 'ED'], required: true },
  sequence:          { type: Number, required: true },
  episodesCovered:   { type: String, default: null },

  // Multi-resolution video (ALL resolutions kept)
  videoSources: [{
    resolution: { type: Number, required: true },
    url:        { type: String, required: true },
    tags:       [{ type: String }],
  }],
  videoUrl:          { type: String, required: true },
  videoResolution:   { type: Number, default: null },

  // Community stats (updated by Mongoose hooks)
  avgRating:         { type: Number, default: 0 },
  totalRatings:      { type: Number, default: 0 },
  totalWatches:      { type: Number, default: 0 },
  totalListens:      { type: Number, default: 0 },

  syncedAt:          { type: Date, required: true },
}, { timestamps: true });

// TEXT INDEX — powers all search
ThemeCacheSchema.index({
  songTitle:             'text',
  artistName:            'text',
  allArtists:            'text',
  animeTitle:            'text',
  animeTitleEnglish:     'text',
  animeTitleAlternative: 'text',
}, {
  weights: {
    songTitle:             10,
    artistName:            9,
    allArtists:            8,
    animeTitle:            6,
    animeTitleEnglish:     5,
    animeTitleAlternative: 3,
  },
  name: 'theme_full_search'
});

ThemeCacheSchema.index({ animeSeason: 1, animeSeasonYear: 1 });
ThemeCacheSchema.index({ avgRating: -1, totalRatings: -1 });
ThemeCacheSchema.index({ totalWatches: -1 });
ThemeCacheSchema.index({ artistSlugs: 1 });
ThemeCacheSchema.index({ type: 1 });
ThemeCacheSchema.index({ anilistId: 1 });
```

### `animecaches` — `AnimeCache.model.ts`
```typescript
const AnimeCacheSchema = new Schema({
  anilistId:         { type: Number, required: true, unique: true },
  malId:             { type: Number, default: null },
  titleRomaji:       { type: String, required: true },
  titleEnglish:      { type: String, default: null },
  titleNative:       { type: String, default: null },
  synonyms:          [{ type: String }],
  season:            { type: String, enum: ['WINTER','SPRING','SUMMER','FALL', null], default: null },
  seasonYear:        { type: Number, default: null },
  genres:            [{ type: String }],
  coverImageLarge:   { type: String, default: null },
  bannerImage:       { type: String, default: null },
  atCoverImage:      { type: String, default: null },
  atGrillImage:      { type: String, default: null },
  totalEpisodes:     { type: Number, default: null },
  status:            { type: String, default: null },
  averageScore:      { type: Number, default: null },
  syncedAt:          { type: Date, required: true },
}, { timestamps: true });

AnimeCacheSchema.index({ anilistId: 1 });
AnimeCacheSchema.index({ malId: 1 });
```

### `artistcaches` — `ArtistCache.model.ts`
```typescript
const ArtistCacheSchema = new Schema({
  slug:          { type: String, required: true, unique: true },
  animethemesId: { type: Number, required: true },
  name:          { type: String, required: true },
  aliases:       [{ type: String }],
  imageUrl:      { type: String, default: null },
  totalThemes:   { type: Number, default: 0 },
  syncedAt:      { type: Date, required: true },
}, { timestamps: true });

ArtistCacheSchema.index({ slug: 1 });
ArtistCacheSchema.index({ name: 'text', aliases: 'text' });
```

### `ratings` — `Rating.model.ts`
```typescript
const RatingSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  themeId:   { type: Schema.Types.ObjectId, ref: 'ThemeCache', required: true },
  themeSlug: { type: String, required: true },
  score:     { type: Number, required: true, min: 1, max: 10 },
  mode:      { type: String, enum: ['watch', 'listen'], required: true },
}, { timestamps: true });

RatingSchema.index({ userId: 1, themeId: 1 }, { unique: true });
RatingSchema.index({ userId: 1 });
RatingSchema.index({ themeId: 1 });

RatingSchema.post('save', async function() {
  const stats = await mongoose.model('Rating').aggregate([
    { $match: { themeId: this.themeId } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
  ]);
  await mongoose.model('ThemeCache').findByIdAndUpdate(this.themeId, {
    avgRating: parseFloat((stats[0]?.avg ?? 0).toFixed(2)),
    totalRatings: stats[0]?.count ?? 0,
  });
  await mongoose.model('User').findByIdAndUpdate(
    this.userId,
    { $inc: { totalRatings: 1 } }
  );
});
```

### `watchhistories` — `WatchHistory.model.ts`
```typescript
const WatchHistorySchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  themeId:   { type: Schema.Types.ObjectId, ref: 'ThemeCache', required: true },
  themeSlug: { type: String, required: true },
  mode:      { type: String, enum: ['watch', 'listen'], required: true },
  viewedAt:  { type: Date, default: Date.now },
}, { timestamps: false });

WatchHistorySchema.index({ userId: 1, viewedAt: -1 });
WatchHistorySchema.index({ themeId: 1 });
WatchHistorySchema.index({ viewedAt: -1 });

WatchHistorySchema.post('save', async function() {
  const field = this.mode === 'watch' ? 'totalWatches' : 'totalListens';
  await mongoose.model('ThemeCache')
    .findByIdAndUpdate(this.themeId, { $inc: { [field]: 1 } });
});
```

### `follows` — `Follow.model.ts`
```typescript
const FollowSchema = new Schema({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
FollowSchema.index({ followerId: 1 });
FollowSchema.index({ followeeId: 1 });

FollowSchema.post('save', async function() {
  await mongoose.model('User').findByIdAndUpdate(this.followerId, { $inc: { totalFollowing: 1 } });
  await mongoose.model('User').findByIdAndUpdate(this.followeeId, { $inc: { totalFollowers: 1 } });
});

FollowSchema.post('deleteOne', { document: true }, async function() {
  await mongoose.model('User').findByIdAndUpdate(this.followerId, { $inc: { totalFollowing: -1 } });
  await mongoose.model('User').findByIdAndUpdate(this.followeeId, { $inc: { totalFollowers: -1 } });
});
```

### Other schemas (unchanged)
```typescript
// Favorite: { userId, themeId, themeSlug } — unique(userId, themeId)
// Friendship: { requesterId, addresseeId, status: pending|accepted|blocked }
// Notification: {
//   recipientId, actorId,
//   type: friend_request | friend_accepted | friend_rated | friend_favorited | follow,
//   entityId, entityMeta, read: Boolean
// }
```

---

## 3. SEED SCRIPT — FULL IMPLEMENTATION

### Overview
```
IMPORTANT: Run ONCE before first deploy only.
MongoDB Atlas is a cloud database — data persists forever between deploys.
Do NOT re-run seed on subsequent deploys.

scripts/seed.ts             → full seed (first time)
scripts/seed.ts --incremental → weekly via Vercel Cron (new seasons only)

Data flow:
1. Paginate ALL themes from AnimeThemes API
2. For each theme: upsert ThemeCache + ArtistCache
3. If anime.season is null: AniList lookup → get season, alt names, cover
4. Progress saved to seed-progress.json (resumable if interrupted)
```

### AnimeThemes Pagination Strategy
```typescript
const BASE_URL = 'https://api.animethemes.moe'

async function getTotalThemePages(): Promise<number> {
  const res = await fetch(
    `${BASE_URL}/animetheme?page[size]=1&page[number]=1` +
    `&include=animethemeentries.videos,song.artists,anime.images`
  )
  const data = await res.json()
  return Math.ceil(data.meta.total / 100)
}

async function fetchThemePage(page: number) {
  const res = await fetch(
    `${BASE_URL}/animetheme` +
    `?page[size]=100&page[number]=${page}` +
    `&include=animethemeentries.videos,song.artists,anime.images,anime.animethemes`
  )
  if (!res.ok) throw new Error(`AT API error: ${res.status}`)
  return res.json()
}
```

### Complete Theme Parsing
```typescript
function parseATTheme(atTheme: any): Partial<IThemeCacheInput> | null {
  const anime = atTheme.anime
  if (!anime) return null

  const entry = atTheme.animethemeentries?.[0]
  if (!entry) return null

  const videos = entry.videos ?? []
  const sortedVideos = [...videos].sort((a, b) => b.resolution - a.resolution)
  if (sortedVideos.length === 0) return null

  const artists = atTheme.song?.artists ?? []
  const allArtists  = artists.map((a: any) => a.name)
  const artistSlugs = artists.map((a: any) => a.slug)
  const artistRoles = artists.map((a: any) => a.as ?? 'performer')

  const images = anime.images ?? []
  const atCoverImage    = images.find((i: any) => i.facet === 'Cover')?.link ?? null
  const animeGrillImage = images.find((i: any) => i.facet === 'Grill')?.link ?? null

  const videoSources = sortedVideos.map((v: any) => ({
    resolution: v.resolution,
    url: v.link,
    tags: [v.source, v.nc ? 'NC' : null].filter(Boolean),
  }))

  return {
    slug:              `${anime.slug}-${atTheme.type.toLowerCase()}${atTheme.sequence}`,
    animethemesId:     atTheme.id,
    songTitle:         atTheme.song?.title ?? 'Unknown',
    artistName:        artists[0]?.name ?? null,
    allArtists, artistSlugs, artistRoles,
    animeTitle:        anime.name,
    animeSeason:       anime.season?.toUpperCase() ?? null,
    animeSeasonYear:   anime.year ?? null,
    animeCoverImage:   atCoverImage,
    animeGrillImage,
    type:              atTheme.type as 'OP' | 'ED',
    sequence:          atTheme.sequence ?? 1,
    episodesCovered:   entry.episodes ?? null,
    videoSources,
    videoUrl:          sortedVideos[0].link,
    videoResolution:   sortedVideos[0].resolution,
    syncedAt:          new Date(),
  }
}
```

### AniList Fallback
```typescript
async function enrichFromAniList(malId: number) {
  const query = `
    query GetByMalId($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        id title { romaji english native } synonyms
        season seasonYear genres coverImage { large } bannerImage
      }
    }
  `
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { malId } }),
    })
    const { data } = await res.json()
    if (!data?.Media) return null
    const media = data.Media
    return {
      season: media.season ?? null, seasonYear: media.seasonYear ?? null,
      titleEnglish: media.title.english ?? null,
      titleAlternative: [media.title.native, media.title.romaji, ...media.synonyms].filter(Boolean),
      coverImage: media.coverImage?.large ?? null,
      bannerImage: media.bannerImage ?? null,
      genres: media.genres ?? [], anilistId: media.id,
    }
  } catch { return null }
}
```

---

## 4. ROUTE HANDLERS (replaces Express)

### MongoDB Connection (singleton)
```typescript
// lib/db.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
let cached = (global as any).mongoose ?? { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

### Route Handler pattern
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ThemeCache } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    // ... query MongoDB
    return NextResponse.json({ success: true, data: results, meta: { page, total, hasMore } })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error', code: 500 }, { status: 500 })
  }
}
```

### All Route Handlers needed
```
app/api/auth/login/route.ts               POST (public)
app/api/auth/register/route.ts            POST (public)
app/api/auth/refresh/route.ts             POST (reads httpOnly cookie)
app/api/auth/logout/route.ts              POST (clears httpOnly cookie)
app/api/themes/popular/route.ts           GET ?type&page
app/api/themes/seasonal/route.ts          GET ?season&year&type&page
app/api/themes/[slug]/route.ts            GET
app/api/search/route.ts                   GET ?q&by&type&page
app/api/anime/[anilistId]/route.ts        GET
app/api/artist/[slug]/route.ts            GET
app/api/artist/[slug]/themes/route.ts     GET
app/api/ratings/route.ts                  POST (auth required)
app/api/ratings/[themeSlug]/mine/route.ts GET (auth required)
app/api/favorites/route.ts                POST + DELETE (auth required)
app/api/friends/route.ts                  GET (auth required)
app/api/friends/requests/route.ts         GET (auth required)
app/api/friends/activity/route.ts         GET (auth required)
app/api/friends/[id]/route.ts             PATCH + DELETE (auth required)
app/api/follow/[username]/route.ts        POST + DELETE + GET (auth required)
app/api/notifications/route.ts            GET (auth required)
app/api/notifications/unread-count/route.ts GET (auth required)
app/api/notifications/mark-read/route.ts  PATCH (auth required)
app/api/users/me/route.ts                 GET + PATCH (auth required)
app/api/users/[username]/route.ts         GET (public)
app/api/history/route.ts                  GET + POST (auth required)
app/api/stats/live/route.ts               GET (public)
app/api/sync/seasonal/route.ts            POST (cron secret required)
```

---

## 5. MANUAL JWT AUTH SETUP

```typescript
// lib/auth.ts (server-side only)
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const ACCESS_SECRET  = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JWTPayload {
  userId: string
  email:  string
}

// Access token — 15 minutes
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

// Refresh token — 7 days
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try { return jwt.verify(token, ACCESS_SECRET) as JWTPayload }
  catch { return null }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try { return jwt.verify(token, REFRESH_SECRET) as JWTPayload }
  catch { return null }
}

// Password helpers
export const hashPassword   = (pw: string) => bcrypt.hash(pw, 12)
export const comparePassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)
```

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signAccessToken, signRefreshToken, comparePassword } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { email, password } = LoginSchema.parse(body)

    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid credentials', code: 401 }, { status: 401 })

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ success: false, error: 'Invalid credentials', code: 401 }, { status: 401 })

    const payload = { userId: user._id.toString(), email: user.email }
    const accessToken  = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const res = NextResponse.json({
      success: true,
      data: { accessToken, user: { id: user._id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl } }
    })

    // Set refresh token in httpOnly cookie
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,  // 7 days
      path: '/api/auth',
    })

    return res
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error', code: 500 }, { status: 500 })
  }
}
```

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signAccessToken, signRefreshToken, hashPassword } from '@/lib/auth'
import { z } from 'zod'

const RegisterSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8),
  username:    z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1).max(40),
})

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { email, password, username, displayName } = RegisterSchema.parse(body)

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) return NextResponse.json({ success: false, error: 'Email or username already taken', code: 409 }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await User.create({ email, username, displayName, passwordHash })

    const payload = { userId: user._id.toString(), email: user.email }
    const accessToken  = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const res = NextResponse.json({
      success: true,
      data: { accessToken, user: { id: user._id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl } }
    }, { status: 201 })

    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/api/auth',
    })

    return res
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error', code: 500 }, { status: 500 })
  }
}
```

```typescript
// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value
  if (!refreshToken) return NextResponse.json({ success: false, error: 'No refresh token', code: 401 }, { status: 401 })

  const payload = verifyRefreshToken(refreshToken)
  if (!payload) return NextResponse.json({ success: false, error: 'Invalid refresh token', code: 401 }, { status: 401 })

  // Rotate both tokens
  const newAccessToken  = signAccessToken({ userId: payload.userId, email: payload.email })
  const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email })

  const res = NextResponse.json({ success: true, data: { accessToken: newAccessToken } })
  res.cookies.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/api/auth',
  })
  return res
}
```

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/api/auth' })
  return res
}
```

```typescript
// lib/auth-client.ts (client-side)
// In-memory access token store — never persisted to localStorage
let _accessToken: string | null = null

export function getAccessToken() { return _accessToken }
export function setAccessToken(token: string | null) { _accessToken = token }

// Called on 401 — tries to get a new access token using refresh cookie
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!res.ok) return null
    const { data } = await res.json()
    setAccessToken(data.accessToken)
    return data.accessToken
  } catch { return null }
}

// Auth-aware fetch wrapper — auto-retries on 401
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await fetch(url, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      })
    }
  }

  return res
}

// Login helper
export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.success) setAccessToken(data.data.accessToken)
  return data
}

// Logout helper
export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' })
  setAccessToken(null)
}
```

```typescript
// middleware.ts — JWT protection
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

const PROTECTED_ROUTES = [
  '/friends', '/notifications', '/history', '/settings',
  '/api/ratings', '/api/favorites', '/api/friends',
  '/api/follow', '/api/notifications', '/api/users/me', '/api/history',
]

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED_ROUTES.some(r => req.nextUrl.pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  const payload = token ? verifyAccessToken(token) : null

  if (!payload) {
    // For page routes: redirect to login
    if (!req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // For API routes: 401
    return NextResponse.json({ success: false, error: 'Unauthorized', code: 401 }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/friends/:path*', '/notifications/:path*', '/history/:path*', '/settings/:path*',
    '/api/ratings/:path*', '/api/favorites/:path*', '/api/friends/:path*',
    '/api/follow/:path*', '/api/notifications/:path*', '/api/users/me/:path*',
    '/api/history/:path*',
  ]
}
```

```typescript
// providers/AuthProvider.tsx ("use client")
// Attempts silent refresh on mount to restore session after page reload
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { refreshAccessToken, setAccessToken, logout as clientLogout } from '@/lib/auth-client'

interface AuthUser { id: string; username: string; displayName: string; avatarUrl: string | null }
interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  setUser: (u: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to restore session via refresh token cookie
    refreshAccessToken()
      .then(token => {
        if (!token) { setIsLoading(false); return }
        // Fetch user profile with new token
        return fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(({ data }) => { if (data) setUser(data) })
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = async () => {
    await clientLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

---

## 6. SEARCH

```typescript
// app/api/search/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = searchParams.get('q') ?? ''
  const type = searchParams.get('type')  // OP | ED
  const page = parseInt(searchParams.get('page') ?? '1')

  if (q.length < 2) {
    return NextResponse.json({ success: false, error: 'Query too short', code: 400 }, { status: 400 })
  }

  await connectDB()
  const limit = 20
  const skip = (page - 1) * limit

  const filter: any = { $text: { $search: q } }
  if (type) filter.type = type

  const [results, total] = await Promise.all([
    ThemeCache.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip).limit(limit).lean(),
    ThemeCache.countDocuments(filter)
  ])

  return NextResponse.json({
    success: true,
    data: results,
    meta: { page, total, hasMore: skip + results.length < total }
  })
}
```

---

## 7. POPULAR THEMES

```typescript
const filter = {
  totalRatings: { $gte: 3 },
  ...(type && { type }),
}
ThemeCache.find(filter)
  .sort({ avgRating: -1, totalRatings: -1, totalWatches: -1 })
  .skip(skip).limit(30).lean()
```

---

## 8. SEASONAL BROWSING

```typescript
// GET /api/themes/seasonal?season=WINTER&year=2026&type=OP&page=1
ThemeCache.find({ animeSeason: season, animeSeasonYear: year, ...(type && { type }) })
  .sort({ totalWatches: -1, avgRating: -1 })
  .skip(skip).limit(30).lean()

export function generateSeasonList(count = 12) {
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const currentIdx = month <= 3 ? 0 : month <= 6 ? 1 : month <= 9 ? 2 : 3
  const result = []
  let idx = currentIdx, y = year
  for (let i = 0; i < count; i++) {
    result.push({ season: seasons[idx], year: y, label: `${seasons[idx]} ${y}` })
    idx--
    if (idx < 0) { idx = 3; y-- }
  }
  return result
}
```

---

## 9. ARTIST PAGES

```typescript
// GET /api/artist/:slug
const artist = await ArtistCache.findOne({ slug }).lean()
const themes = await ThemeCache.find({ artistSlugs: slug })
  .sort({ avgRating: -1, totalRatings: -1 })
  .lean()
return { artist, themes }
```

---

## 10. FOLLOW SYSTEM

```typescript
// POST /api/follow/:username — follow a user
// DELETE /api/follow/:username — unfollow
// GET /api/follow/:username — { following: boolean }

// Follow creates a Notification of type 'follow' for the followee
// Follow.post('save') hook updates User.totalFollowing + User.totalFollowers
```

---

## 11. LIVE STATS

```typescript
// GET /api/stats/live — public, no auth
const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
const [active, listening] = await Promise.all([
  WatchHistory.distinct('userId', { viewedAt: { $gte: fiveMinAgo } }),
  WatchHistory.distinct('userId', { viewedAt: { $gte: fiveMinAgo }, mode: 'listen' }),
])
const avatars = await User
  .find({ _id: { $in: listening.slice(0, 5) } })
  .select('avatarUrl').lean()

return { activeUsers: active.length, listeningNow: listening.length, avatars: avatars.map(u => u.avatarUrl) }
```

---

## 12. VERCEL CRON (weekly incremental sync)

```json
// vercel.json
{
  "crons": [{
    "path": "/api/sync/seasonal",
    "schedule": "0 3 * * 1"
  }]
}
```

```typescript
// app/api/sync/seasonal/route.ts
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('authorization')
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Run incremental sync for latest 2 seasons only
}
```

---

## 13. QUERY KEYS

```typescript
export const queryKeys = {
  themes: {
    popular:  (type?: string) => ['themes', 'popular', type],
    seasonal: (season: string, year: number, type?: string) => ['themes', 'seasonal', season, year, type],
    bySlug:   (slug: string) => ['themes', slug],
    byArtist: (slug: string) => ['themes', 'artist', slug],
  },
  search:   { results: (q: string, by?: string, type?: string) => ['search', q, by, type] },
  anime:    { byId: (id: number) => ['anime', id] },
  artist:   { bySlug: (slug: string) => ['artist', slug] },
  ratings:  { mine: (themeSlug: string) => ['ratings', 'mine', themeSlug] },
  favorites:{ byUser: (userId: string) => ['favorites', userId] },
  friends:  {
    list:     (userId: string) => ['friends', userId],
    requests: (userId: string) => ['friends', 'requests', userId],
    activity: (userId: string) => ['friends', 'activity', userId],
  },
  follow:   {
    status:   (username: string) => ['follow', 'status', username],
    followers:(username: string) => ['follow', 'followers', username],
    following:(username: string) => ['follow', 'following', username],
  },
  notifications: {
    list:        (userId: string) => ['notifications', userId],
    unreadCount: (userId: string) => ['notifications', 'count', userId],
  },
  profile:  { byUsername: (username: string) => ['profile', username] },
  stats:    { live: () => ['stats', 'live'] },
}
```

---

## 14. ENV VARIABLES

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_64_char_random_access_secret
JWT_REFRESH_SECRET=your_64_char_random_refresh_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_random_cron_secret

# Vercel dashboard (production)
MONGODB_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=...
```
