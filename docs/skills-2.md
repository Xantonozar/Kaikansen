# Kaikansen — skills.md
> Phase-by-phase implementation guide.
> **v6 — Pure Next.js 16. Vercel. Seed Script (run once). Manual JWT. Custom Tailwind UI. No shadcn.**
> Each phase = one focused AI coding session. Follow in order.

---

## AGENT SKILLS — INSTALL FIRST

```bash
npx skills add vercel-labs/agent-skills@react-best-practices
npx skills add vercel-labs/agent-skills@web-design-guidelines
npx skills add https://github.com/vercel-labs/next-skills --skill next-best-practices
npx skills add https://github.com/jezweb/claude-skills --skill tanstack-query
npx skills add https://github.com/mindrally/skills --skill mongodb-development
npx skills add https://github.com/mindrally/skills --skill security-best-practices
npx skills add https://github.com/mindrally/skills --skill zod-schema-validation
```

---

# PHASE 0 — Seed Script (Run Once Before First Deploy)

## Step 0.1 — Seed Setup
```
IMPORTANT:
- This runs ONCE before your very first deploy.
- MongoDB Atlas is a cloud database — data persists between all future deploys.
- Do NOT re-run seed on subsequent deploys. Weekly cron handles new seasons.

Install seed dependencies:
  npm install -D ts-node dotenv

Create scripts/seed.ts — implement exactly from knowledge.md §3:
  - getTotalThemePages()
  - fetchThemePage(page)
  - parseATTheme()
  - enrichFromAniList(malId) — ONLY when season is null
  - main(): loop all pages, upsert ThemeCache + ArtistCache + AnimeCache
  - Save progress to seed-progress.json after each page

Create scripts/seed-utils.ts:
  - delay(ms): Promise sleep
  - loadProgress() / saveProgress()

Add to tsconfig.json: "ts-node": { "files": true }
Add script: "seed": "ts-node scripts/seed.ts"
```

## Step 0.2 — Run Seed
```
npm run seed
Expected time: 2-4 hours for ~15,000+ themes.
Progress saved — safe to restart if interrupted.

Verify in MongoDB Atlas after completion:
  db.themecaches.countDocuments()     → ~15,000+
  db.artistcaches.countDocuments()    → ~3,000+
  db.themecaches.getIndexes()         → should show "theme_full_search"
  db.themecaches.findOne({ songTitle: /gurenge/i })

Only proceed to Phase 1 after seed verified.
```

---

# PHASE 1 — Project Setup

## Step 1.1 — Next.js 16 Init
```bash
npx create-next-app@16 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --turbopack \
  --react-compiler

# Install all runtime dependencies at once:
npm install \
  jsonwebtoken \
  bcryptjs \
  next-themes \
  @tanstack/react-query @tanstack/react-query-devtools \
  mongoose \
  plyr \
  sonner \
  lucide-react \
  clsx tailwind-merge \
  zod

# Install type definitions:
npm install -D \
  @types/jsonwebtoken \
  @types/bcryptjs \
  @types/plyr \
  ts-node \
  dotenv

# Create vercel.json:
{
  "crons": [{ "path": "/api/sync/seasonal", "schedule": "0 3 * * 1" }]
}
```

## Step 1.2 — ESLint Flat Config (Next.js 16)
```
Next.js 16 uses flat config — delete any .eslintrc.json if present.
eslint.config.mjs is already created by create-next-app.
Verify it matches rules.md §13.

Add lint script to package.json:
  "lint": "eslint . --max-warnings 0"

Note: next lint command is removed in Next.js 16. Run via npm run lint.
```

## Step 1.3 — Tailwind + Global CSS
```
Update tailwind.config.ts:
  - darkMode: ['class', '[data-theme="dark"]']
  - Add all tokens from design.md §2:
    colors: bg (base/surface/elevated/overlay/toast/header),
            accent (DEFAULT/hover/pressed/subtle/container/on/glow/mint/mint-hover/mint-container/ed/ed-subtle/ed-container),
            ktext (primary/secondary/tertiary/disabled/on-accent),
            border (subtle/default/strong/accent),
            semantic (success/warning/error/info)
    fontFamily: display (Outfit), body (Inter), mono (JetBrains Mono)
    borderRadius: card (20px), card-lg (24px), pill (9999px), input (12px)
    boxShadow: card, card-hover, modal, accent-glow, avatar-glow

Create app/globals.css:
  - @tailwind base/components/utilities
  - :root light mode CSS vars (design.md §2)
  - [data-theme="dark"] dark mode CSS vars (design.md §2)
  - .interactive state layer class (design.md §5)
  - Animation keyframes: fadeUp, scaleIn, shimmer, eq1-eq8 (design.md §11)
  - @media (prefers-reduced-motion) override
  - Plyr custom CSS overrides (mint teal controls)
```

## Step 1.4 — Database + Models
```
Create lib/db.ts — MongoDB singleton from knowledge.md §4.

Create lib/models/index.ts — import + export all Mongoose models.
Create all models (lib/models/*.model.ts) from knowledge.md §2:
  - User.model.ts         → includes passwordHash field (bcryptjs)
  - ThemeCache.model.ts   → full schema with videoSources[], text index
  - AnimeCache.model.ts
  - ArtistCache.model.ts
  - Rating.model.ts       → post-save hook (recalculate avgRating)
  - WatchHistory.model.ts → post-save hook (increment totalWatches/Listens)
  - Follow.model.ts       → post-save + post-deleteOne hooks
  - Favorite.model.ts
  - Friendship.model.ts
  - Notification.model.ts → type includes 'follow'
```

## Step 1.5 — Auth Setup (Manual JWT)
```
Create lib/auth.ts (server-side) from knowledge.md §5:
  - signAccessToken(payload)   → JWT, 15min expiry
  - signRefreshToken(payload)  → JWT, 7d expiry
  - verifyAccessToken(token)   → JWTPayload | null
  - verifyRefreshToken(token)  → JWTPayload | null
  - hashPassword(pw)           → bcrypt hash, 12 rounds
  - comparePassword(pw, hash)  → boolean

Create lib/auth-client.ts (client-side) from knowledge.md §5:
  - _accessToken in-memory variable (never localStorage)
  - getAccessToken() / setAccessToken()
  - refreshAccessToken() → calls /api/auth/refresh
  - authFetch() → auto-retry on 401 with fresh token
  - login() / logout() helpers

Create middleware.ts from knowledge.md §5:
  - Reads Authorization: Bearer <token>
  - Page routes: redirect to /login if unauthorized
  - API routes: return 401 JSON if unauthorized
  - Protected routes list from rules.md §7
```

## Step 1.6 — Auth API Routes
```
Create app/api/auth/login/route.ts (POST) from knowledge.md §5:
  - Validate email + password with Zod
  - bcrypt compare password
  - Issue access token (in response body) + refresh token (httpOnly cookie)

Create app/api/auth/register/route.ts (POST):
  - Validate email, password, username, displayName with Zod
  - Check for existing user
  - bcrypt hash password → User.create
  - Issue both tokens same as login

Create app/api/auth/refresh/route.ts (POST):
  - Read refresh_token from httpOnly cookie
  - verifyRefreshToken → get payload
  - Issue new access token + rotate refresh token cookie

Create app/api/auth/logout/route.ts (POST):
  - Clear refresh_token cookie (maxAge: 0)
  - Return success
```

## Step 1.7 — Providers + Root Layout
```
Create providers/ThemeProvider.tsx ("use client"):
  import { ThemeProvider as NextThemes } from 'next-themes'
  attribute="data-theme", defaultTheme="system", enableSystem

Create providers/QueryProvider.tsx ("use client"):
  QueryClientProvider + ReactQueryDevtools (dev only)
  staleTime: 5min, gcTime: 10min

Create providers/AuthProvider.tsx ("use client") from knowledge.md §5:
  - On mount: call refreshAccessToken() to restore session after reload
  - If token: fetch /api/users/me to hydrate user state
  - Exposes: { user, isLoading, setUser, logout } via useAuth() hook

Create app/layout.tsx:
  - Import Outfit + Inter from next/font/google
  - suppressHydrationWarning on <html>
  - Wrap: ThemeProvider → QueryProvider → AuthProvider → children + Toaster (sonner)
  - Apply font CSS variables

Create lib/queryKeys.ts — full object from knowledge.md §13
Create lib/utils.ts:
  getScoreColor(score): string
  getScoreLabel(score): string
  formatCount(n): string   (1.2k, 3.4M)
  timeAgo(date): string
  cn(...inputs): string    (clsx + tailwind-merge)

Create hooks/useAuth.ts — re-export useAuth from AuthProvider

Create .env.local:
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=<64-char-random>
  JWT_REFRESH_SECRET=<64-char-random>
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  CRON_SECRET=<random>
```

---

# PHASE 2 — Core API Route Handlers

## Step 2.1 — Theme Routes
```
Create app/api/themes/popular/route.ts (GET):
  Auth: none
  Params: type (OP|ED), page
  Query: ThemeCache, totalRatings >= 3
  Sort: avgRating DESC, totalRatings DESC, totalWatches DESC
  From knowledge.md §7

Create app/api/themes/seasonal/route.ts (GET):
  Auth: none
  Params: season, year, type, page
  Filter: animeSeason + animeSeasonYear
  From knowledge.md §8

Create app/api/themes/[slug]/route.ts (GET):
  Auth: none
  Returns: full ThemeCache doc including videoSources[]
```

## Step 2.2 — Search Route
```
Create app/api/search/route.ts (GET):
  Auth: none
  Params: q (min 2 chars), type (OP|ED), page
  Full $text search on ThemeCache using "theme_full_search" index
  Return 400 if q.length < 2
  From knowledge.md §6
```

## Step 2.3 — Artist + Anime Routes
```
Create app/api/artist/[slug]/route.ts (GET):
  Auth: none
  1. ArtistCache.findOne({ slug })
  2. ThemeCache.find({ artistSlugs: slug }).sort({ avgRating: -1 })
  Return: { artist, themes }

Create app/api/artist/[slug]/themes/route.ts (GET):
  Auth: none
  ThemeCache.find({ artistSlugs: slug }).lean()

Create app/api/anime/[anilistId]/route.ts (GET):
  Auth: none
  1. AnimeCache.findOne({ anilistId })
  2. ThemeCache.find({ anilistId }).sort({ type: 1, sequence: 1 })
  Return: { anime, themes, openings, endings }

Create app/api/stats/live/route.ts (GET):
  Auth: none — public
  From knowledge.md §11
```

## Step 2.4 — User Routes
```
Create app/api/users/[username]/route.ts (GET):
  Auth: none (public profile)
  User.findOne({ username }).select('-passwordHash').lean()

Create app/api/users/me/route.ts (GET + PATCH):
  Auth: required (JWT)
  GET: return current user from verifyAccessToken payload → DB lookup
  PATCH: Zod validate { displayName?, bio?, avatarUrl? }, update User
```

## Step 2.5 — Protected Action Routes
```
Create app/api/ratings/route.ts (POST):
  Auth: required
  Zod: { themeSlug, score (1-10), mode (watch|listen) }
  Rating.findOneAndUpdate({ userId, themeId }, ..., { upsert: true })

Create app/api/ratings/[themeSlug]/mine/route.ts (GET):
  Auth: required
  Rating.findOne({ userId, themeSlug })

Create app/api/favorites/route.ts (POST + DELETE):
  Auth: required
  POST: Favorite.create + notify friends
  DELETE: Favorite.findOneAndDelete

Create app/api/history/route.ts (GET + POST):
  Auth: required
  GET: WatchHistory paginated newest first, filter by mode
  POST: create WatchHistory entry (triggers totalWatches/Listens)
```

## Step 2.6 — Friends, Follow, Notifications Routes
```
Create app/api/friends/route.ts (GET):
  Auth: required — return accepted friendships, populate username + avatarUrl

Create app/api/friends/requests/route.ts (GET):
  Auth: required — pending friendships where addresseeId = current user

Create app/api/friends/activity/route.ts (GET):
  Auth: required — last 10 ratings by accepted friends

Create app/api/friends/[id]/route.ts (PATCH + DELETE):
  Auth: required
  PATCH: accept friendship request
  DELETE: decline or unfriend

Create app/api/follow/[username]/route.ts (GET + POST + DELETE):
  Auth: required for POST/DELETE
  GET: { following: boolean } — public
  POST: Follow.create + Notification.create({ type: 'follow' })
  DELETE: Follow.findOneAndDelete

Create app/api/notifications/route.ts (GET): auth required
Create app/api/notifications/unread-count/route.ts (GET): auth required
Create app/api/notifications/mark-read/route.ts (PATCH): auth required
```

## Step 2.7 — Sync Route
```
Create app/api/sync/seasonal/route.ts (POST):
  Verify: Authorization: Bearer {CRON_SECRET}
  Run incremental sync for current season only
  Return: { synced: count, season, year }
```

---

# PHASE 3 — Auth UI

## Step 3.1 — Login Page
```
Create app/login/page.tsx (Server Component shell)
Create app/components/auth/LoginForm.tsx ("use client"):

Uses lib/auth-client.ts login():
  - On success: setUser(data.user), router.push('/')
  - On error: show error message

Layout (design.md §8.16):
  - Full page bg-bg-base
  - Wave ≋ icon in accent-container box
  - "Kaikansen" Display font + "THE ETHEREAL TIDE" small caps
  - Auth card: bg-bg-surface rounded-[24px] shadow-modal max-w-sm mx-auto
  - "Welcome back" Display Small heading
  - Email input: bg-bg-elevated rounded-[12px] with mail icon prefix
  - Password input: show/hide toggle (lucide Eye/EyeOff)
  - "Sign In" button: full-width rounded-full bg-accent text-white
  - "Don't have an account? Create one" link to /register
  - Form state: loading spinner on button while submitting
```

## Step 3.2 — Register Page
```
Create app/register/page.tsx + RegisterForm.tsx ("use client"):

Uses lib/auth-client.ts fetch to POST /api/auth/register:
  - Fields: displayName, username, email, password
  - Zod client-side validation before submit
  - On success: setUser(data.user), router.push('/')

Layout matches login but:
  - "Begin your journey" heading
  - "Begin Journey →" CTA button
  - Extra fields: username + displayName
  - Link to /login
```

---

# PHASE 4 — Home Page

## Step 4.1 — Home Page Server Component
```
Create app/page.tsx (Server Component):

Fetch initial data on server (no auth needed):
  const popularRes  = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/themes/popular?page=1`)
  const featuredRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/themes/seasonal?season=WINTER&year=2026&page=1`)
  const statsRes    = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stats/live`)

Pass as initialData props to HomeClient.
```

## Step 4.2 — Home Page Client
```
Create app/components/home/HomeClient.tsx ("use client"):

THREE SECTIONS:

1. FEATURED STRIP (current season horizontal scroll):
   - "CURRENT SEASON" accent label + season name heading + "View All →" link
   - overflow-x-auto scrollbar-hide -mx-4 px-4 gap-3 flex
   - ThemeFeaturedCard × 6 (w-[75vw] aspect-video)
   - useQuery with initialData from server

2. FRIENDS ACTIVITY (auth required, has friends):
   - useAuth() to check login state
   - useQuery(queryKeys.friends.activity(userId), { enabled: !!user })
   - Last 5 items as ThemeListRow with friendUsername + friendScore
   - Hidden if not logged in or empty

3. POPULAR THEMES (infinite scroll):
   - "Popular Themes" heading + OP/ED filter toggle
   - useInfiniteQuery(queryKeys.themes.popular(type), { initialData })
   - ThemeListRow for each result
   - IntersectionObserver sentinel div at bottom for load more

4. LIVE STATS FOOTER:
   - useStats() hook (30s refetch)
   - Active Users + Listening Now cards with avatar stack
   - design.md §20
```

## Step 4.3 — ThemeListRow Component
```
Create app/components/theme/ThemeListRow.tsx ("use client"):

Props: slug, songTitle, artistName, animeTitle, animeCoverImage,
       type, sequence, avgRating, totalRatings, videoUrl, videoSources,
       artistSlugs?, friendUsername?, friendScore?, qualityBadges?

Layout (design.md §8.5):
  - bg-bg-surface rounded-[16px] border shadow-card min-h-[72px]
  - next/image: w-16 h-16 rounded-[12px]
  - OP/ED badge: teal pill for OP, peach for ED
  - Song title semibold, artist link → /artist/[slug], anime tertiary
  - Quality badges: tiny dark pills (4K, NC, 1080p)
  - Friends section: "@username rated X/10" in accent color
  - Normal: ★ {avgRating} ({totalRatings})
  - Play circle button right side → /theme/[slug]
```

## Step 4.4 — ThemeFeaturedCard + ThemeCard
```
Create app/components/theme/ThemeFeaturedCard.tsx ("use client"):
  - w-[75vw] md:w-72, aspect-video, rounded-[20px]
  - Background: animeCoverImage or animeGrillImage
  - Score badge top-left
  - Gradient overlay bottom → title + type badge
  - Link to /theme/[slug]
  - design.md §8.4

Create app/components/theme/ThemeCard.tsx ("use client"):
  - 16:9 image + info below (for season page grid)
  - OP/ED badge, score badge, hover: scale + card lift
  - design.md §8.6
```

---

# PHASE 5 — Theme Page

## Step 5.1 — Theme Page
```
Create app/theme/[slug]/page.tsx (Server Component):
  const theme = await serverFetch(`/api/themes/${slug}`)
  Pass as initialData to ThemePageClient

Create app/theme/[slug]/ThemePageClient.tsx ("use client")
```

## Step 5.2 — VideoPlayer Component
```
Create app/components/theme/VideoPlayer.tsx ("use client"):
  import Plyr from 'plyr'
  import 'plyr/dist/plyr.css'

  - videoSources[] → Plyr quality options
  - mode: 'watch' | 'listen'
    - watch: normal video
    - listen: hide video element, show equalizer animation
  - playsInline always
  - On first play: POST /api/history (using authFetch)
  - Custom CSS in globals.css for mint teal Plyr controls
```

## Step 5.3 — Rating + Toggle Components
```
Create app/components/theme/WatchListenToggle.tsx ("use client"):
  - Two pill buttons: Watch | Listen
  - Active: bg-accent, Inactive: border
  - design.md §8.7

Create app/components/theme/RatingWidget.tsx ("use client"):
  - "Circles" variant: two rows 1-5 and 6-10
  - Selected: filled circle in accent color
  - Confirm button: POST /api/ratings via authFetch
  - design.md §8.8

Full theme page layout (design.md §8.17):
  VideoPlayer → WatchListenToggle → song info card
  → stats row (3 cards: rating / watches / listens)
  → RatingWidget → credits section → quick actions
```

---

# PHASE 6 — Search Page

## Step 6.1 — Search
```
Create app/search/page.tsx (Server Component shell)
Create app/components/search/SearchClient.tsx ("use client"):

  - Full-width pill search bar (rounded-full h-12, bg-bg-elevated)
  - Filter chips: [All] [Song] [Singer] [Anime]
    Active: bg-accent text-white
    Inactive: border text-ktext-secondary
  - 300ms debounce on input
  - useInfiniteQuery on query change
  - ThemeListRow results (heart icon instead of play button for favorites)
  - Empty state: "Search for your favourite opening or ending"
  - Loading: ThemeListRowSkeleton × 6
```

---

# PHASE 7 — Anime + Artist Pages

## Step 7.1 — Anime Page
```
Create app/anime/[anilistId]/page.tsx (Server Component):
  const { anime, themes } = await serverFetch(`/api/anime/${anilistId}`)

Layout (design.md §8.13):
  - Hero banner: animeGrillImage h-56 full-bleed, gradient bottom
  - Genre tags overlay bottom-left on banner
  - Title + AniList score + episodes below banner
  - "OPENINGS" section: ThemeListRow for each OP
  - "ENDINGS" section: ThemeListRow for each ED
  - Artist names link to /artist/[slug]
```

## Step 7.2 — Artist Page
```
Create app/artist/[slug]/page.tsx (Server Component):
  const { artist, themes } = await serverFetch(`/api/artist/${slug}`)

Create app/components/artist/ArtistHeader.tsx ("use client"):

Layout (design.md §8.11 + §18):
  - Circular avatar w-28 h-28 ring-2 ring-accent-mint
  - Dark: teal ambient glow
  - Name: uppercase bold
  - Bio/tagline if present
  - Stats: Total Themes card
  - FollowButton component

Create app/components/artist/ArtistDiscographyRow.tsx:
  - Circular image + song title + anime name + OP/ED badge + year
```

---

# PHASE 8 — User Profile + History

## Step 8.1 — User Profile Page
```
Create app/user/[username]/page.tsx (Server Component):
  const profile = await serverFetch(`/api/users/${username}`)

Layout (design.md §8.9):
  - Avatar w-24 ring-2 ring-accent-mint
  - Name + bio
  - Own profile: "Edit Profile" outlined button
  - Other: FollowButton + "Message" button (placeholder)
  - Stats 3 boxes: RATINGS | FOLLOWING | FOLLOWERS
  - Recent activity: ThemeListRow list
```

## Step 8.2 — History Page
```
Create app/history/page.tsx ("use client"):
  - Redirect to /login if no user (check useAuth)

Layout (design.md §8.12):
  - "Watch History" heading
  - Filter tabs: All | Watched | Listened
  - Date groups: TODAY / YESTERDAY / OLDER
  - HistoryCard: w-20 h-20 image, mode icon, song + artist, time + rating
  - Infinite scroll via useInfiniteQuery
```

---

# PHASE 9 — Follow System

## Step 9.1 — Follow Components
```
Create hooks/useFollow.ts ("use client"):
  - GET /api/follow/:username → { following }
  - POST /api/follow/:username → follow (using authFetch)
  - DELETE /api/follow/:username → unfollow (using authFetch)
  - Uses queryKeys.follow.status(username)
  - Invalidates profile query on success

Create app/components/shared/FollowButton.tsx ("use client"):
  Uses useFollow(username)
  States: Loading → Follow (filled) → Following (outlined)
  Light: bg-accent text-white → bg-accent-container text-accent
  Dark: border-accent-mint text-accent-mint → bg-accent-container
  design.md §19
```

---

# PHASE 10 — Friends System

## Step 10.1 — Friends Page
```
Create app/friends/page.tsx ("use client"):
  - Redirect to /login if no user

Layout (design.md §8.5):
  "Connections" teal heading + "+ Add Friend" pill button
  Tabs: Friends | Requests [count badge]

  Friends tab ("YOUR CIRCLE"):
    - FriendCard: avatar + online dot + name + bio + action buttons

  Requests tab ("PENDING REQUESTS"):
    - Accept + Decline buttons per request

  Add Friend: search input → results → "Send Request" button
```

---

# PHASE 11 — Notifications

## Step 11.1 — Notifications Page
```
Create app/notifications/page.tsx ("use client"):
  - Redirect to /login if no user

Layout (design.md §8.4):
  "Notifications" heading + "Mark all as read" button
  useNotifications() hook: refetchInterval 60_000

NotificationCard.tsx per type:
  - friend_request: Accept + Decline inline
  - friend_rated: theme thumbnail right side
  - friend_favorited: heart icon right side
  - follow: FollowButton (follow back)
  - friend_accepted: simple text

"OLDER NOTIFICATIONS" divider
Bell badge in BottomNav shows red dot if unreadCount > 0
```

---

# PHASE 12 — Settings + Dark Mode

## Step 12.1 — Settings Page
```
Create app/settings/page.tsx ("use client"):
  - Redirect to /login if no user

Layout (design.md §8.15 + §17):
  User card: avatar + displayName
  Section labels: teal uppercase (dark) / gray (light)

  ACCOUNT: Personal Details | Security (chevron rows)
  NOTIFICATIONS: Push toggle | Email toggle
  PRIVACY: Data Privacy | Appearance

  ThemeToggle (design.md §17):
    3-option pill: ☀️ Light | 🌙 Dark | 💻 System
    Uses useTheme() from next-themes

  Logout button:
    Calls useAuth().logout() → authFetch POST /api/auth/logout → setUser(null)
    style: teal in light (#0A8A96), crimson in dark (#8B1A1A)

Create hooks/useTheme.ts — wraps useTheme from next-themes
Create app/components/shared/ThemeToggle.tsx — 3-option pill component
```

---

# PHASE 13 — Navigation + Layout

## Step 13.1 — Navigation Components
```
Create app/components/layout/AppHeader.tsx ("use client"):
  - useTheme() → rounded-b-[24px] (dark) / border-b (light)
  - Left: back arrow or hamburger (usePathname)
  - Center: ≋ + "Kaikansen"
  - Right: search icon + user avatar (useAuth().user?.avatarUrl)
  - design.md §8.1

Create app/components/layout/BottomNav.tsx ("use client"):
  - usePathname() for active detection
  - next/link for navigation
  - 4 items: Home / Search / Alerts / Profile
  - Active: teal pill behind icon
  - Bell: red dot if useNotifications().unreadCount > 0
  - flex md:hidden
  - design.md §8.2

Create app/components/layout/NavigationRail.tsx ("use client"):
  - hidden md:flex — same destinations as BottomNav
  - lg: show text labels
  - design.md §8.3

Create app/components/layout/PageWrapper.tsx:
  - Correct padding for nav clearance (pt for header, pb for bottom nav)
```

---

# PHASE 14 — Loading States + Polish

## Step 14.1 — Skeletons
```
Create loading.tsx in each route folder:
  app/loading.tsx
  app/search/loading.tsx
  app/theme/[slug]/loading.tsx
  app/artist/[slug]/loading.tsx
  app/anime/[anilistId]/loading.tsx
  app/user/[username]/loading.tsx

Create app/components/shared/LoadingSkeleton.tsx:
  ThemeListRowSkeleton, ThemeFeaturedCardSkeleton, ThemeCardSkeleton,
  ProfileHeaderSkeleton, NotificationSkeleton, ArtistHeaderSkeleton
  All use .shimmer animation from globals.css
```

## Step 14.2 — Empty States
```
Create app/components/shared/EmptyState.tsx:
  NoResults, NoHistory, NoFriends, NoNotifications,
  NoPopular, SeasonEmpty, NoArtistThemes
  Each: icon (lucide) + title + subtitle text
```

## Step 14.3 — Error Boundary
```
Create app/components/shared/ErrorBoundary.tsx ("use client"):
  Standard React error boundary
  Show friendly error UI with retry button
```

---

# PHASE 15 — Deploy

## Step 15.1 — Pre-Deploy Checklist
```
LOCAL (before first deploy):
1. Confirm seed ran successfully — ThemeCache ~15,000+
2. npm run dev → test browsing home, search, theme page
3. Test dark mode toggle
4. Test auth flow: register → login → logout
5. Test protected routes: /history, /settings redirect to /login when logged out
6. Test rating a theme — verify avgRating updates
7. Test token refresh: wait 15min or manually expire, verify silent refresh works
8. npm run lint → 0 errors
9. npm run build → must pass with 0 errors
```

## Step 15.2 — Vercel Setup
```
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<64-char-random>
   JWT_REFRESH_SECRET=<64-char-random>
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   CRON_SECRET=<random>
4. Deploy

POST-DEPLOY VERIFY:
1. /api/themes/popular → returns data
2. /api/search?q=gurenge → returns results
3. /api/stats/live → returns { activeUsers, listeningNow }
4. Login + rate a theme → avgRating updates
5. Dark mode toggle works
6. Cron: every Monday 3am → GET /api/sync/seasonal (auto, no action needed)
```

## Step 15.3 — DEPLOY.md
```
Create /DEPLOY.md with the full checklist above for future reference.

REMINDER:
- Seed runs ONCE. Do not re-run on future deploys.
- MongoDB Atlas persists all data between deploys.
- Weekly cron handles new anime season data automatically.
- The live app NEVER calls AniList or AnimeThemes directly.
```
