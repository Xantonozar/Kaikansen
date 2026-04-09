# Kaikansen — rules.md
> Hard rules for every AI agent, developer, or code generation session.
> **v6 — Pure Next.js 16 App Router. Vercel hosting. MongoDB Atlas. Seed script. Manual JWT. No shadcn.**
> Do NOT deviate from these unless explicitly told to in the session prompt.

---

## 1. PROJECT IDENTITY

- App name: **Kaikansen** — anime OP/ED rating, discovery, and social platform
- Primary entity: **OP/ED themes** — anime is metadata attached to themes, not the focus
- Homepage: Popular OP/EDs + friends activity + current season featured strip
- Target: Mobile-first anime fans
- Language: TypeScript everywhere. No plain JS.

---

## 2. ARCHITECTURE — PURE NEXT.JS ON VERCEL

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL                             │
│                                                     │
│   Next.js 16 App Router                             │
│   ├── /app/api/...  (Route Handlers = API)          │
│   ├── Server Components (data fetching)             │
│   ├── Client Components (interactions)              │
│   └── middleware.ts (JWT auth protection)           │
│                                                     │
│   MongoDB Atlas (direct connection)                 │
│   └── All data pre-seeded before first deploy only  │
└─────────────────────────────────────────────────────┘

ZERO external API calls from live app:
  ✅ Search → MongoDB only
  ✅ Ratings → MongoDB only
  ✅ Browse → MongoDB only
  ✅ Artist pages → MongoDB only

AniList + AnimeThemes → ONLY called by seed script (pre-first-deploy)
Seed script runs ONCE. MongoDB Atlas persists forever. No re-seeding on deploy.
```

### NO Express. NO separate server. NO backend folder.

---

## 3. TECH STACK

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router | Pages = `page.tsx`, API = `route.ts` |
| Hosting | Vercel | Free tier works, Pro for cron jobs |
| Database | MongoDB Atlas | Direct from Next.js via Mongoose |
| Auth | Manual JWT | Access token in memory, refresh token in httpOnly cookie |
| Dark mode | next-themes | `data-theme` attribute |
| Video player | Plyr | `"use client"` component |
| Client state | TanStack Query v5 | Mutations + client queries |
| Styling | Tailwind CSS + CSS vars | Light/dark via CSS custom properties |
| UI components | Custom Tailwind components | No shadcn — hand-built only |
| Validation | Zod | All API route inputs |
| Seed script | `scripts/seed.ts` | Run ONCE pre-first-deploy with ts-node |
| Scheduled sync | Vercel Cron Jobs | Weekly re-sync for new seasons |
| Bundler | Turbopack | Default in Next.js 16, no config needed |
| Node.js minimum | 20.9 | Required by Next.js 16 |

---

## 4. FOLDER STRUCTURE

```
/
├── app/                                  ← Next.js App Router
│   ├── layout.tsx                        ← Root: ThemeProvider + QueryProvider
│   ├── globals.css                       ← CSS variables (light/dark) + animations
│   ├── middleware.ts                     ← JWT auth protection
│   ├── not-found.tsx
│   │
│   ├── page.tsx                          ← HomePage (Server Component)
│   ├── loading.tsx
│   ├── search/page.tsx
│   ├── theme/[slug]/page.tsx
│   ├── anime/[anilistId]/page.tsx
│   ├── artist/[slug]/page.tsx
│   ├── season/[season]/[year]/page.tsx
│   ├── user/[username]/page.tsx
│   ├── friends/page.tsx
│   ├── notifications/page.tsx
│   ├── history/page.tsx
│   ├── settings/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts            ← POST: issue access + refresh tokens
│   │   │   ├── register/route.ts         ← POST: create user + issue tokens
│   │   │   ├── refresh/route.ts          ← POST: rotate refresh token
│   │   │   └── logout/route.ts           ← POST: clear refresh cookie
│   │   ├── themes/
│   │   │   ├── popular/route.ts
│   │   │   ├── seasonal/route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── artist/
│   │   │   ├── [slug]/route.ts
│   │   │   └── [slug]/themes/route.ts
│   │   ├── search/route.ts
│   │   ├── anime/[anilistId]/route.ts
│   │   ├── ratings/route.ts
│   │   ├── ratings/[themeSlug]/mine/route.ts
│   │   ├── favorites/route.ts
│   │   ├── friends/
│   │   │   ├── route.ts
│   │   │   ├── requests/route.ts
│   │   │   ├── activity/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── follow/[username]/route.ts
│   │   ├── notifications/
│   │   │   ├── route.ts
│   │   │   ├── unread-count/route.ts
│   │   │   └── mark-read/route.ts
│   │   ├── users/
│   │   │   ├── me/route.ts
│   │   │   └── [username]/route.ts
│   │   ├── history/route.ts
│   │   ├── stats/live/route.ts
│   │   └── sync/
│   │       └── seasonal/route.ts         ← triggered by Vercel Cron
│   │
│   └── components/
│       ├── auth/
│       │   ├── LoginForm.tsx             ← "use client"
│       │   └── RegisterForm.tsx          ← "use client"
│       ├── theme/
│       │   ├── ThemeListRow.tsx          ← "use client"
│       │   ├── ThemeFeaturedCard.tsx     ← "use client"
│       │   ├── ThemeCard.tsx             ← "use client"
│       │   ├── VideoPlayer.tsx           ← "use client" — Plyr
│       │   ├── WatchListenToggle.tsx     ← "use client"
│       │   └── RatingWidget.tsx          ← "use client"
│       ├── artist/
│       │   ├── ArtistHeader.tsx          ← "use client"
│       │   └── ArtistDiscographyRow.tsx
│       ├── layout/
│       │   ├── AppHeader.tsx             ← "use client"
│       │   ├── BottomNav.tsx             ← "use client"
│       │   ├── NavigationRail.tsx        ← "use client"
│       │   └── PageWrapper.tsx
│       └── shared/
│           ├── LoadingSkeleton.tsx
│           ├── EmptyState.tsx
│           ├── ThemeToggle.tsx           ← "use client"
│           ├── FollowButton.tsx          ← "use client"
│           └── ErrorBoundary.tsx         ← "use client"
│
├── lib/
│   ├── db.ts                             ← MongoDB connection (singleton)
│   ├── auth.ts                           ← JWT sign/verify helpers (server)
│   ├── auth-client.ts                    ← Client token store + auto-refresh
│   ├── models/
│   │   ├── index.ts
│   │   ├── User.model.ts                 ← Includes passwordHash field
│   │   ├── ThemeCache.model.ts
│   │   ├── AnimeCache.model.ts
│   │   ├── ArtistCache.model.ts
│   │   ├── Rating.model.ts
│   │   ├── WatchHistory.model.ts
│   │   ├── Favorite.model.ts
│   │   ├── Friendship.model.ts
│   │   ├── Follow.model.ts
│   │   └── Notification.model.ts
│   ├── api/                              ← Client-side fetch wrappers
│   │   ├── themes.ts
│   │   ├── artist.ts
│   │   ├── search.ts
│   │   ├── ratings.ts
│   │   ├── friends.ts
│   │   ├── follow.ts
│   │   ├── notifications.ts
│   │   ├── users.ts
│   │   ├── history.ts
│   │   └── stats.ts
│   ├── queryKeys.ts
│   ├── utils.ts
│   └── theme.ts
│
├── hooks/
│   ├── useUser.ts
│   ├── useAuth.ts                        ← access token store + refresh logic
│   ├── useRating.ts
│   ├── useFavorite.ts
│   ├── useFriends.ts
│   ├── useNotifications.ts
│   ├── useSearch.ts
│   ├── useTheme.ts
│   ├── useFollow.ts
│   └── useStats.ts
│
├── providers/
│   ├── QueryProvider.tsx                 ← "use client"
│   ├── ThemeProvider.tsx                 ← "use client"
│   └── AuthProvider.tsx                 ← "use client" — token refresh on mount
│
├── types/
│   ├── app.types.ts
│   └── api.types.ts
│
├── scripts/
│   ├── seed.ts                           ← Run ONCE before first deploy
│   ├── seed-utils.ts
│   └── seed-progress.json
│
├── next.config.ts                        ← TypeScript config (Next.js 16)
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs                     ← Flat config (Next.js 16)
├── vercel.json                           ← Cron job config
├── AGENTS.md                             ← AI agent guidance (Next.js 16 default)
└── package.json
```

---

## 5. DATABASE RULES

- All Mongoose models in `/lib/models/`
- MongoDB connection: singleton in `/lib/db.ts` — call `connectDB()` at top of every Route Handler
- `syncedAt` on AnimeCache, ThemeCache, ArtistCache — stale after **7 days**
- `videoSources[]` — ALL resolutions stored, never discard lower ones
- `animeCoverImage` — always set (AT Cover → AniList fallback)
- `allArtists[]` — every artist name for this theme (for search)
- `artistSlugs[]` — every artist slug (for artist page links)
- `artistRoles[]` — vocalist / band / composer etc.
- Text indexes: ThemeCache (songTitle, artistName, allArtists, animeTitle, animeTitleAlternative)
- Text indexes: ArtistCache (name)
- `.lean()` for all read-only queries
- Max 50/page default

---

## 6. SEED RULES (CRITICAL)

- Seed script lives at `scripts/seed.ts`
- Run **ONCE** before first deploy only: `npx ts-node scripts/seed.ts`
- MongoDB Atlas persists data — **never re-seed on subsequent deploys**
- AnimeThemes = PRIMARY source for everything
- AniList = FALLBACK ONLY when AnimeThemes missing season/year
- Never call AniList/AnimeThemes from live app Route Handlers
- Seed is resumable via `seed-progress.json`
- 700ms delay between AnimeThemes calls
- 1000ms delay between AniList calls

---

## 7. AUTH RULES (Manual JWT)

- **Access token**: signed JWT, 15 minute expiry, stored in memory (JS variable) — never localStorage
- **Refresh token**: signed JWT, 7 day expiry, stored in httpOnly `refresh_token` cookie
- JWT signing: `jsonwebtoken` library with `JWT_SECRET` and `JWT_REFRESH_SECRET` env vars
- Password hashing: `bcryptjs` (12 rounds)
- `lib/auth.ts` (server): `signAccessToken(payload)`, `signRefreshToken(payload)`, `verifyAccessToken(token)`, `verifyRefreshToken(token)`
- `lib/auth-client.ts` (client): in-memory `accessToken` variable, `getAccessToken()`, `setAccessToken()`, `refreshAccessToken()` (calls `/api/auth/refresh`)
- `hooks/useAuth.ts`: `useAuth()` hook — exposes `user`, `isLoading`, `login()`, `logout()`
- `providers/AuthProvider.tsx`: on mount, attempt silent refresh via `/api/auth/refresh` to restore session after page reload
- `middleware.ts`: reads `Authorization: Bearer <token>` header, verifies with `JWT_SECRET`, blocks protected routes
- Protected routes send `Authorization: Bearer <accessToken>` header — set automatically by fetch wrappers in `lib/api/`
- On 401 from any API: auto-call `/api/auth/refresh`, retry original request once, then logout if refresh fails
- No manual JWT in `User` model — store `passwordHash` field only

---

## 8. API ROUTE RULES

Every Route Handler (`route.ts`) must:
1. Call `await connectDB()` at top
2. For protected routes: call `verifyAccessToken()` from `lib/auth.ts` using the `Authorization` header
3. Validate input with Zod
4. Return `NextResponse.json({ success: true, data })` or `{ success: false, error, code }`
5. Wrap in try/catch

Response shape (always consistent):
```typescript
{ success: true,  data: T, meta?: { page, total, hasMore } }
{ success: false, error: string, code: number }
```

Auth helper pattern for protected routes:
```typescript
import { verifyAccessToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  const payload = token ? verifyAccessToken(token) : null
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized', code: 401 }, { status: 401 })
  // payload.userId, payload.email available
}
```

---

## 9. DARK MODE RULES

- Library: `next-themes`
- `ThemeProvider` wraps layout, `attribute="data-theme"`, `defaultTheme="system"`
- `suppressHydrationWarning` on `<html>`
- All colors via CSS custom properties (design.md §2) — auto-switch on `[data-theme="dark"]`
- `useTheme()` hook in `/hooks/useTheme.ts`
- `ThemeToggle` component in Settings page

---

## 10. UI RULES (No shadcn)

- **No shadcn/ui** — all components hand-built with Tailwind CSS
- No `components/ui/` directory
- Reusable primitives (Button, Input, Badge, Avatar, etc.) live in `components/shared/` or inline
- All design tokens come from `design.md` — colors, spacing, radius, shadows via CSS vars
- Tailwind config extends design tokens from `design.md §2`

---

## 11. VERCEL RULES

- All sync functions max 300s (Vercel Pro)
- Vercel Cron Jobs for weekly re-sync: `vercel.json` with cron schedule
- `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` — environment variables in Vercel dashboard
- `NEXT_PUBLIC_APP_URL` — client-safe app URL
- `CRON_SECRET` — protects `/api/sync/seasonal`

```json
// vercel.json
{
  "crons": [{
    "path": "/api/sync/seasonal",
    "schedule": "0 3 * * 1"
  }]
}
```

---

## 12. MOBILE-FIRST RULES

- Tailwind mobile-first — `md:` and `lg:` for larger screens
- Bottom Nav: `flex md:hidden`
- Navigation Rail: `hidden md:flex`
- Touch targets: `min-h-11 min-w-11` (44px)
- Video: `playsInline` always
- Font minimum: `text-sm` (14px)

---

## 13. ESLINT RULES (Next.js 16)

- Flat config format: `eslint.config.mjs` — no `.eslintrc.json`
- `next lint` command removed in Next.js 16 — run linting via `npm run lint` script
- Config uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
])
```

---

## 14. MVP SCOPE

### ✅ Included
- Next.js 16 App Router (pure, no Express)
- Vercel hosting + Turbopack
- Seed script (AnimeThemes → MongoDB, AniList fallback) — run once only
- All OP/EDs from AnimeThemes database (~15,000+ themes)
- Artist names, singer names, band names stored and searchable
- Popular themes home page
- Friends activity feed
- Season featured strip + Season browsing page
- Theme page with Plyr
- Rating 1–10
- Full-text search (song / artist / anime)
- Artist pages
- User profiles
- Follow / Unfollow
- Friends system
- Notifications (60s polling)
- Watch/Listen history
- Light + Dark mode
- Live stats
- Manual JWT auth (access in memory, refresh in httpOnly cookie)

### ❌ Frozen for v2
- Comments system
- Leaderboard
- Social login (OAuth)
- Push/email notifications
- Real-time (WebSockets)
- Lyrics API fetch
- Playlist/Library
- Admin panel
