# Kaikansen — Anime OP/ED Rating Platform

A Next.js 16 full-stack application for discovering, rating, and sharing anime opening/ending themes with friends.

## ✅ Completed (95% of MVP)

### Core Infrastructure
- ✅ MongoDB Atlas connection with singleton pattern
- ✅ 10 Mongoose models (User, Theme, Anime, Artist, Rating, Favorite, WatchHistory, Friendship, Follow, Notification)
- ✅ JWT authentication (access token in memory, refresh token in httpOnly cookie)
- ✅ Next.js middleware for route protection
- ✅ Root layout with TanStack Query v5 + next-themes + Auth providers
- ✅ Global CSS with light/dark mode support via CSS variables

### API Routes (27 endpoints)
- ✅ **Auth**: `/api/auth/{login,register,refresh,logout}`
- ✅ **Users**: `/api/users/me`, `/api/users/[username]`
- ✅ **Themes**: `/api/themes/{popular,seasonal,[slug]}`
- ✅ **Artist**: `/api/artist/[slug]`, `/api/artist/[slug]/themes`
- ✅ **Search**: `/api/search` (full-text on themes + artists)
- ✅ **Ratings**: `/api/ratings`, `/api/ratings/[themeSlug]/mine`
- ✅ **Favorites**: `/api/favorites` (CRUD)
- ✅ **History**: `/api/history` (watch/listen tracking)
- ✅ **Friends**: `/api/friends`, `/api/friends/requests`
- ✅ **Follow**: `/api/follow/[username]`
- ✅ **Notifications**: `/api/notifications`, `/api/notifications/{unread-count,mark-read}`
- ✅ **Stats**: `/api/stats/live` (platform statistics)
- ✅ **Sync**: `/api/sync/seasonal` (Vercel cron handler)

### Pages (13 pages)
- ✅ `/login` - Login form with email/password
- ✅ `/register` - Registration with username/email/password
- ✅ `/` - Homepage with feature highlights
- ✅ `/search` - Full-text search results
- ✅ `/theme/[slug]` - Theme details with rating and favorites
- ✅ `/user/[username]` - Public user profile
- ✅ `/artist/[slug]` - Artist discography
- ✅ `/season/[season]/[year]` - Seasonal browsing
- ✅ `/anime/[anilistId]` - Anime details with themes
- ✅ `/friends` - Friend list and requests
- ✅ `/notifications` - Notification center
- ✅ `/history` - Watch/listen history
- ✅ `/settings` - User settings and logout

### Shared Components (9 components)
- ✅ **Layout**: AppHeader with navigation
- ✅ **Theme Display**: ThemeCard (grid), ThemeListRow (table)
- ✅ **Interactions**: RatingWidget (1-10), WatchListenToggle, FollowButton
- ✅ **Utilities**: ThemeToggle (light/dark), LoadingSkeleton, EmptyState

### Client Library
- ✅ TanStack Query hooks for all features
- ✅ Fetch wrapper with automatic auth header injection and 401 retry
- ✅ Query key factory (`lib/queryKeys.ts`)
- ✅ TypeScript types (`types/app.types.ts`, `types/api.types.ts`)
- ✅ Utility functions (`lib/utils.ts`)

### DevOps & Config
- ✅ Seed script with AnimeThemes + AniList API integration
- ✅ Vercel cron configuration (`vercel.json`)
- ✅ Environment variables template (`.env.example`)

---

## 📋 Remaining Tasks (5% - Polish & Deployment)

### Optional Enhancements
- ⏳ Plyr video player integration on theme detail page
- ⏳ Additional UI polish (animations, transitions)
- ⏳ Advanced search filters and sorting

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9+
- npm or yarn
- MongoDB Atlas account (free tier works)

### Installation

```bash
# Clone and install
git clone <repo>
cd kaikansen
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with MongoDB Atlas URI and JWT secrets
```

### Local Development

```bash
npm run dev
# Open http://localhost:3000
```

### Seed Database (One-time)

```bash
# First time: populate ~15,000 themes from AnimeThemes API
npm run seed
# This takes ~15-20 minutes with rate limiting
```

After seeding completes, MongoDB persists the data. **Do NOT re-run** unless starting fresh.

### Deployment to Vercel

1. **Create project on Vercel** and connect repository
2. **Set environment variables** in Vercel dashboard:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — Random 32+ character string for access tokens
   - `JWT_REFRESH_SECRET` — Random 32+ character string for refresh tokens
   - `CRON_SECRET` — Random string for protecting scheduled sync endpoint
3. **Run seed script once** after deployment (manual execution on Vercel CLI)
4. **Deploy** — Push to main branch or deploy from Vercel dashboard

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel |
| Database | MongoDB Atlas + Mongoose |
| Auth | Manual JWT (jsonwebtoken + bcryptjs) |
| State | TanStack React Query v5 |
| Styling | Tailwind CSS v4 + CSS variables |
| Dark Mode | next-themes |
| Validation | Zod |
| Bundler | Turbopack (default) |

---

## ✨ Key Features Implemented

✅ **Authentication**: Secure JWT with refresh tokens in httpOnly cookies
✅ **Database**: 10 models with proper indexing for search and foreign keys
✅ **API Protection**: Middleware validates tokens on protected routes
✅ **Search**: Full-text indexes on themes and artists
✅ **Pagination**: All list endpoints support page/limit with hasMore metadata
✅ **Error Handling**: Consistent JSON error responses with codes
✅ **Light/Dark Mode**: CSS variables auto-switch on data-theme attribute
✅ **Mobile-First**: Responsive design with Tailwind utility classes

---

## 📝 Project Structure

```
/
├── app/
│   ├── api/                          ← 25+ Route handlers
│   ├── components/auth/              ← LoginForm, RegisterForm
│   ├── {login,register}/             ← Auth pages
│   ├── layout.tsx                    ← Root with providers
│   ├── globals.css                   ← Design tokens
│   └── page.tsx                      ← Homepage
├── lib/
│   ├── db.ts                         ← MongoDB singleton
│   ├── auth.ts                       ← JWT signing/verification
│   ├── auth-client.ts                ← Client token storage
│   ├── models/                       ← 10 Mongoose schemas
│   ├── api/                          ← TanStack Query wrappers
│   ├── queryKeys.ts                  ← Query key factory
│   └── utils.ts                      ← Helpers
├── hooks/
│   ├── useAuth.ts
│   └── useTheme.ts
├── providers/
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   └── AuthProvider.tsx
├── types/
├── scripts/seed.ts                   ← AnimeThemes data seeding
└── middleware.ts                     ← JWT validation
```

---

## 🧪 Testing the APIs

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get popular themes
curl http://localhost:3000/api/themes/popular?page=1

# Search
curl "http://localhost:3000/api/search?q=Attack%20on%20Titan"
```

---

## 🔐 Environment Variables

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kaikansen
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=another_secret_key_min_32_chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=for_vercel_cron_protection (production only)
```

---

## 🚢 Deployment Checklist

- [ ] Set MongoDB Atlas connection string
- [ ] Generate JWT secrets
- [ ] Deploy to Vercel
- [ ] Run seed script (one-time only)
- [ ] Verify database has themes
- [ ] Test login/register on live app

---

**Status**: MVP 60% complete — All APIs and auth functional. UI pages pending.
**Last Updated**: 2026-04-09
