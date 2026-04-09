# Kaikansen — design.md
> Complete design system. Mobile-first. Light + Dark mode.
> **v5 — Tidal UI. Pure Next.js. Vercel. Seed Script. No Express. Better Auth.**
> Reference this before building any UI component or page.

---

## 1. VISUAL IDENTITY

**Concept:** "Ethereal Tide" — flowing teal and navy inspired by bioluminescent ocean depths.
The app should feel like a premium music platform at the intersection of anime culture and modern design.

**Mood:** Clean, immersive, slightly editorial. Premium but not corporate. Warm but not playful.

**Design Language:** Material You (M3) 2026 — adaptive layouts, tonal elevation, container-based composition, expressive state layers.

**Logo Mark:** `≋` wave character + "Kaikansen" wordmark in display font.

**Primary Content:** Anime OP/EDs — the hero of every screen is a ThemeListRow or ThemeCard, not an anime poster.

---

## 2. COLOR SYSTEM

### CSS Custom Properties (globals.css)

```css
/* ── LIGHT MODE (default) ── */
:root {
  /* Backgrounds */
  --bg-base:     #E8F4F7;   /* Page canvas — light blue-teal */
  --bg-surface:  #FFFFFF;   /* Cards, panels, nav containers */
  --bg-elevated: #F0F8FA;   /* Hover states, inputs */
  --bg-overlay:  #E2EFF3;   /* Modals, sheets, drawers */
  --bg-toast:    #D4E8ED;   /* Toasts, tooltips */
  --bg-header:   #FFFFFF;   /* App header bar */

  /* Primary Accent — Dark Teal */
  --accent:              #0A8A96;
  --accent-hover:        #0C9DA8;
  --accent-pressed:      #086E78;
  --accent-subtle:       rgba(10, 138, 150, 0.10);
  --accent-subtle-hover: rgba(10, 138, 150, 0.18);
  --accent-container:    rgba(10, 138, 150, 0.12);
  --on-accent-container: #065962;
  --accent-glow:         rgba(10, 138, 150, 0.20);

  /* Secondary Accent — Mint Teal (badges, active, interactive) */
  --accent-mint:           #4ECDC4;
  --accent-mint-hover:     #60D5CD;
  --accent-mint-container: rgba(78, 205, 196, 0.15);
  --on-accent-mint:        #063E3A;

  /* ED Accent — Warm Peach */
  --accent-ed:           #F0A05A;
  --accent-ed-subtle:    rgba(240, 160, 90, 0.12);
  --accent-ed-container: rgba(240, 160, 90, 0.15);
  --on-accent-ed:        #5C3200;

  /* Text */
  --text-primary:   #0D1B2A;
  --text-secondary: #4A7A85;
  --text-tertiary:  #8FAAB0;
  --text-disabled:  #B5CDD2;
  --text-on-accent: #FFFFFF;

  /* Borders */
  --border-subtle:  rgba(10, 138, 150, 0.08);
  --border-default: rgba(10, 138, 150, 0.15);
  --border-strong:  rgba(10, 138, 150, 0.30);
  --border-accent:  rgba(10, 138, 150, 0.50);

  /* Semantic */
  --success:  #16A34A;
  --warning:  #D97706;
  --error:    #DC2626;
  --info:     #0284C7;

  /* Special */
  --logout-bg: #0A8A96;  /* Teal in light mode */
}

/* ── DARK MODE ── */
.dark, [data-theme="dark"] {
  /* Backgrounds */
  --bg-base:     #070F18;   /* Deep navy */
  --bg-surface:  #0C1C28;   /* Cards, panels */
  --bg-elevated: #112233;   /* Hover, inputs */
  --bg-overlay:  #162840;   /* Modals, drawers */
  --bg-toast:    #1A3050;   /* Toasts */
  --bg-header:   #0A1828;   /* Rounded-bottom header */

  /* Primary Accent — Mint Teal (brighter in dark) */
  --accent:              #4ECDC4;
  --accent-hover:        #60D5CD;
  --accent-pressed:      #3EBDB5;
  --accent-subtle:       rgba(78, 205, 196, 0.10);
  --accent-subtle-hover: rgba(78, 205, 196, 0.18);
  --accent-container:    rgba(78, 205, 196, 0.15);
  --on-accent-container: #4ECDC4;
  --accent-glow:         rgba(78, 205, 196, 0.25);

  /* Secondary Accent — Mint same as primary in dark */
  --accent-mint:           #4ECDC4;
  --accent-mint-hover:     #60D5CD;
  --accent-mint-container: rgba(78, 205, 196, 0.15);
  --on-accent-mint:        #063E3A;

  /* ED Accent */
  --accent-ed:           #F0A05A;
  --accent-ed-subtle:    rgba(240, 160, 90, 0.12);
  --accent-ed-container: rgba(240, 160, 90, 0.15);
  --on-accent-ed:        #F0A05A;

  /* Text */
  --text-primary:   #FFFFFF;
  --text-secondary: #7AAAB8;
  --text-tertiary:  #4A6878;
  --text-disabled:  #2A4858;
  --text-on-accent: #063E3A;

  /* Borders */
  --border-subtle:  rgba(78, 205, 196, 0.06);
  --border-default: rgba(78, 205, 196, 0.12);
  --border-strong:  rgba(78, 205, 196, 0.25);
  --border-accent:  rgba(78, 205, 196, 0.45);

  /* Semantic */
  --success:  #22C55E;
  --warning:  #F59E0B;
  --error:    #F87171;
  --info:     #38BDF8;

  /* Special */
  --logout-bg: #8B1A1A;  /* Crimson in dark mode */
}
```

### Tailwind Config Extension

```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay:  'var(--bg-overlay)',
          toast:    'var(--bg-toast)',
          header:   'var(--bg-header)',
        },
        accent: {
          DEFAULT:        'var(--accent)',
          hover:          'var(--accent-hover)',
          pressed:        'var(--accent-pressed)',
          subtle:         'var(--accent-subtle)',
          container:      'var(--accent-container)',
          on:             'var(--on-accent-container)',
          glow:           'var(--accent-glow)',
          mint:           'var(--accent-mint)',
          'mint-hover':   'var(--accent-mint-hover)',
          'mint-container': 'var(--accent-mint-container)',
          ed:             'var(--accent-ed)',
          'ed-subtle':    'var(--accent-ed-subtle)',
          'ed-container': 'var(--accent-ed-container)',
          'on-ed':        'var(--on-accent-ed)',
        },
        ktext: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          disabled:  'var(--text-disabled)',
          'on-accent': 'var(--text-on-accent)',
        },
        border: {
          subtle:  'var(--border-subtle)',
          default: 'var(--border-default)',
          strong:  'var(--border-strong)',
          accent:  'var(--border-accent)',
        },
        semantic: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error:   'var(--error)',
          info:    'var(--info)',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm':      '8px',
        DEFAULT:   '12px',
        'md':      '16px',
        'card':    '20px',
        'card-lg': '24px',
        'pill':    '9999px',
        'input':   '12px',
        'btn':     '12px',
        'btn-lg':  '9999px',
        'header':  '0 0 24px 24px',  /* Dark mode header bottom corners */
      },
      boxShadow: {
        'none':        'none',
        'card':        '0 2px 12px rgba(10, 138, 150, 0.08)',
        'card-hover':  '0 8px 32px rgba(10, 138, 150, 0.15)',
        'modal':       '0 24px 80px rgba(0,0,0,0.25)',
        'accent-glow': '0 0 32px var(--accent-glow)',
        'avatar-glow': '0 0 0 3px var(--accent-mint)',
      }
    }
  }
}
```

---

## 3. TYPOGRAPHY SYSTEM

### Google Fonts Setup
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Class | Size | Weight | Use |
|---|---|---|---|---|
| Display Large | `text-4xl font-display font-extrabold tracking-tight` | 36px | 800 | Hero moments only |
| Display Medium | `text-3xl font-display font-bold tracking-tight` | 30px | 700 | Page titles (desktop) |
| Display Small | `text-2xl font-display font-bold` | 24px | 700 | Page titles (mobile), song titles |
| Headline | `text-xl font-display font-semibold` | 20px | 600 | Section titles |
| Title | `text-base font-body font-semibold` | 16px | 600 | Card titles, tab labels |
| Body | `text-sm font-body font-normal leading-relaxed` | 14px | 400 | Descriptions, meta |
| Label | `text-xs font-body font-medium tracking-wide` | 12px | 500 | Badges, chips, timestamps |
| Score | `text-2xl font-mono font-bold tabular-nums` | 24px | 700 | Large score display |
| Score SM | `text-sm font-mono font-bold tabular-nums` | 14px | 700 | Inline scores |

**Section labels** (TODAY, YOUR CIRCLE, etc.):
```tsx
<span className="text-xs font-body font-semibold tracking-[0.1em] uppercase text-ktext-tertiary">
  TODAY
</span>
```

---

## 4. ELEVATION & SURFACE SYSTEM

### Light Mode Surfaces

| Level | Usage | bg Token |
|---|---|---|
| 0 | Page canvas | `bg-bg-base` |
| 1 | Cards, panels, nav | `bg-bg-surface` (white) |
| 2 | Hovered cards, inputs | `bg-bg-elevated` |
| 3 | Modals, drawers | `bg-bg-overlay` |
| 4 | Toasts, tooltips | `bg-bg-toast` |

Light mode uses `shadow-card` on Level 1 cards instead of tonal tint.

### Dark Mode Surfaces

| Level | Usage | bg Token |
|---|---|---|
| 0 | Page canvas | `bg-bg-base` (`#070F18`) |
| 1 | Cards, panels | `bg-bg-surface` (`#0C1C28`) |
| 2 | Hover, inputs | `bg-bg-elevated` (`#112233`) |
| 3 | Modals | `bg-bg-overlay` (`#162840`) |

Dark mode uses border instead of shadow: `border border-border-subtle`.

### Dark Mode Header (Unique)
```tsx
<header className="bg-bg-header rounded-b-[24px] px-4 py-3 flex items-center justify-between">
  {/* Rounded bottom corners only in dark mode */}
</header>
```

---

## 5. STATE LAYERS (Interactive surfaces)

```css
/* globals.css */
.interactive {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.interactive::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  border-radius: inherit;
  transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
  z-index: 0;
}

.interactive:hover::before        { opacity: 0.06; }
.interactive:active::before       { opacity: 0.12; }
.interactive:focus-visible::before { opacity: 0.08; }

.interactive:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Apply `.interactive` to: ThemeCards, list rows, nav items, buttons, friend cards, all clickable surfaces.

---

## 6. CANONICAL LAYOUTS

### Breakpoints
- **Compact** (< 600px — Mobile): Single pane, Bottom Nav
- **Medium** (600–1240px — Tablet): Navigation Rail (80px)
- **Expanded** (> 1240px — Desktop): Navigation Rail (240px) + two-pane

### Page Wrapper
```tsx
<div className="min-h-screen bg-bg-base flex">
  <NavigationRail className="hidden md:flex" />
  <main className="
    flex-1 min-w-0
    pb-20 md:pb-0
    md:pl-20 lg:pl-60
    px-4 md:px-6 lg:px-8
  ">
    <div className="max-w-2xl mx-auto md:max-w-7xl">
      {children}
    </div>
  </main>
  <BottomNav className="flex md:hidden" />
</div>
```

---

## 7. BORDER RADIUS SYSTEM

| Element | Value | Class |
|---|---|---|
| Page cards, ThemeCard | 20px | `rounded-[20px]` |
| Modals, large drawers | 24px | `rounded-[24px]` |
| Dark mode header (bottom only) | 24px | `rounded-b-[24px]` |
| List row cards | 16px | `rounded-[16px]` |
| Inputs | 12px | `rounded-[12px]` |
| Standard buttons | 12px | `rounded-[12px]` |
| Primary CTA, nav pills, badges | Full | `rounded-full` |
| Avatar | Full circle | `rounded-full` |
| Video player | 20px | `rounded-[20px]` |
| Featured card | 20px | `rounded-[20px]` |
| Stats box | 16px | `rounded-[16px]` |
| Setting section card | 20px | `rounded-[20px]` |

---

## 8. COMPONENT SPECIFICATIONS

### 8.1 App Header

**Light Mode:**
```tsx
<header className="sticky top-0 z-40 bg-bg-surface border-b border-border-subtle px-4 h-14 flex items-center justify-between">
  {/* Left: hamburger or back arrow */}
  <button className="interactive rounded-full p-2">
    <Menu className="w-5 h-5 text-ktext-secondary" />
  </button>

  {/* Center: ≋ + App name */}
  <div className="flex items-center gap-2">
    <span className="text-accent text-xl">≋</span>
    <span className="font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
  </div>

  {/* Right: search + avatar */}
  <div className="flex items-center gap-2">
    <button className="interactive rounded-full p-2">
      <Search className="w-5 h-5 text-ktext-secondary" />
    </button>
    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-accent-mint bg-bg-elevated">
      <img src={avatarUrl} className="w-full h-full object-cover" />
    </div>
  </div>
</header>
```

**Dark Mode Header (rounded bottom):**
```tsx
<header className="sticky top-0 z-40 bg-bg-header rounded-b-[24px] px-4 h-14 flex items-center justify-between shadow-md">
  {/* Same content as above but on dark bg */}
</header>
```

---

### 8.2 Bottom Navigation

```tsx
<nav className="
  flex md:hidden fixed bottom-0 left-0 right-0 z-40
  bg-bg-surface border-t border-border-subtle
  h-16 pb-[env(safe-area-inset-bottom)]
">
  {navItems.map(item => (
    <NavLink key={item.path} to={item.path} className={({ isActive }) => `
      flex-1 flex flex-col items-center justify-center gap-1 relative interactive
      ${isActive ? 'text-accent' : 'text-ktext-tertiary'}
    `}>
      {/* Active: pill bg behind icon */}
      {isActive && (
        <span className="absolute inset-x-auto w-14 h-9 rounded-full bg-accent-container" />
      )}
      <item.Icon className="w-6 h-6 relative z-10" />

      {/* Notification badge */}
      {item.badge > 0 && (
        <span className="absolute top-2 right-1/4 min-w-[16px] h-4
                         bg-error text-white text-[10px] font-mono font-bold
                         rounded-full flex items-center justify-center px-1">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </NavLink>
  ))}
</nav>
```

Bottom nav items: Home (drop/wave icon) · Search · Notifications (bell) · Profile

---

### 8.3 Navigation Rail (Tablet/Desktop)

```tsx
<nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 lg:w-60
                bg-bg-surface border-r border-border-subtle z-40 py-4">
  {/* Logo */}
  <div className="flex items-center gap-3 px-4 mb-8">
    <span className="text-accent text-2xl">≋</span>
    <span className="hidden lg:block font-display font-bold text-lg text-ktext-primary">Kaikansen</span>
  </div>

  {/* Nav items */}
  {navItems.map(item => (
    <NavLink to={item.path} className={({ isActive }) => `
      flex items-center gap-3 mx-2 px-3 py-3 rounded-full
      transition-colors duration-150 interactive
      ${isActive ? 'bg-accent-container text-accent' : 'text-ktext-secondary hover:text-ktext-primary'}
    `}>
      <item.Icon className="w-6 h-6 flex-shrink-0" />
      <span className="hidden lg:block text-sm font-body font-medium">{item.label}</span>
    </NavLink>
  ))}

  <div className="mt-auto px-4">
    <Avatar className="w-10 h-10" />
  </div>
</nav>
```

---

### 8.4 ThemeFeaturedCard (Home — Large Landscape)

Used in the featured/current season horizontal scroll section:

```tsx
<div className="
  flex-shrink-0 relative overflow-hidden rounded-[20px]
  w-[75vw] md:w-72 aspect-video
  interactive cursor-pointer
  bg-bg-surface shadow-card
">
  {/* Background image */}
  <img src={animeCoverImage ?? atCoverImage} className="w-full h-full object-cover" />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

  {/* Score badge — top left */}
  <div className="absolute top-3 left-3 flex items-center gap-1
                  bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
    <span className="text-xs font-mono font-bold text-white">{avgRating.toFixed(1)}</span>
  </div>

  {/* Info — bottom overlay */}
  <div className="absolute bottom-0 left-0 right-0 p-3">
    <p className="text-sm font-display font-bold text-white truncate">{animeTitle}</p>
    <p className="text-xs font-body text-white/70 truncate">{studio}</p>
  </div>
</div>
```

---

### 8.5 ThemeListRow (Popular, Search, Friends Activity)

Image left, text right. Used in home Popular section and search results:

```tsx
<div className="
  flex items-center gap-3 p-3
  bg-bg-surface rounded-[16px]
  border border-border-subtle
  shadow-card interactive cursor-pointer
  transition-all duration-200 hover:shadow-card-hover hover:border-border-default
">
  {/* Cover image — square */}
  <div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
    <img src={animeCoverImage} className="w-full h-full object-cover" />
  </div>

  {/* Text content */}
  <div className="flex-1 min-w-0 space-y-0.5">
    {/* OP/ED badge */}
    <div className="flex items-center gap-1.5 mb-1">
      <span className={`
        text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full
        ${type === 'OP'
          ? 'bg-accent-container text-accent'
          : 'bg-accent-ed-container text-accent-ed'
        }
      `}>
        {type}{sequence}
      </span>
      {/* Quality badges */}
      {qualityBadges?.map(badge => (
        <span key={badge} className="text-[10px] font-mono px-1.5 py-0.5 rounded-full
                                     bg-bg-elevated text-ktext-tertiary border border-border-subtle">
          {badge}
        </span>
      ))}
    </div>

    <p className="text-sm font-body font-semibold text-ktext-primary truncate">{songTitle}</p>
    <p className="text-xs font-body text-ktext-secondary truncate">
      {artistName} · {animeTitle}
    </p>

    {/* For friends activity: username + score */}
    {friendUsername && (
      <p className="text-xs font-body text-accent truncate">
        @{friendUsername} rated {friendScore}/10
      </p>
    )}

    {/* Duration + rating */}
    {!friendUsername && (
      <div className="flex items-center gap-2 pt-0.5">
        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-mono font-bold text-ktext-secondary">
          {avgRating.toFixed(1)}
        </span>
        <span className="text-xs text-ktext-tertiary">({totalRatings})</span>
      </div>
    )}
  </div>

  {/* Right: play button or favorite */}
  <button className="w-9 h-9 rounded-full bg-accent-container
                     flex items-center justify-center flex-shrink-0 interactive">
    <Play className="w-4 h-4 text-accent" />
  </button>
</div>
```

---

### 8.6 ThemeCard (Grid — Season/Search grid variant)

```tsx
<div className="
  group relative overflow-hidden rounded-[20px]
  bg-bg-surface border border-border-default
  shadow-card interactive cursor-pointer
  transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5
">
  {/* 16:9 image */}
  <div className="relative aspect-video overflow-hidden rounded-t-[20px]">
    <img src={animeCoverImage} className="w-full h-full object-cover
               group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    {/* OP/ED badge */}
    <span className={`absolute top-2 left-2 text-xs font-mono font-bold px-2 py-0.5 rounded-full
      ${type === 'OP'
        ? 'bg-accent text-white'
        : 'bg-accent-ed text-white'
      }`}>
      {type}{sequence}
    </span>

    {/* Score */}
    {avgRating > 0 && (
      <div className="absolute top-2 right-2 w-8 h-8 rounded-full
                      flex items-center justify-center text-xs font-mono font-bold text-white"
           style={{ backgroundColor: getScoreColor(Math.round(avgRating)) }}>
        {avgRating.toFixed(1)}
      </div>
    )}
  </div>

  {/* Info */}
  <div className="p-3 space-y-0.5">
    <p className="text-sm font-body font-semibold text-ktext-primary truncate">{songTitle}</p>
    <p className="text-xs font-body text-ktext-secondary truncate">{artistName}</p>
    <p className="text-xs font-body text-ktext-tertiary truncate">{animeTitle}</p>
    <div className="flex items-center gap-1 pt-1">
      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
      <span className="text-xs font-mono font-bold text-ktext-secondary">
        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
      </span>
      <span className="text-xs text-ktext-tertiary">· {totalRatings} ratings</span>
    </div>
  </div>
</div>
```

---

### 8.7 Video Player (Plyr)

```tsx
// /client/src/components/theme/VideoPlayer.tsx
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

// Custom CSS overrides to match design system:
// .plyr--full-ui .plyr__control { color: var(--accent-mint); }
// .plyr--video .plyr__control.plyr__tab-focus,
// .plyr--video .plyr__control:hover { background: var(--accent); }
// .plyr__progress input[type=range]::-webkit-slider-thumb { background: var(--accent-mint); }

<div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-bg-elevated">
  <video
    ref={videoRef}
    playsInline
    poster={animeCoverImage}
    className={mode === 'listen' ? 'hidden' : 'w-full h-full object-cover'}
  >
    {/* Multiple quality sources */}
    {videoSources
      .sort((a, b) => b.resolution - a.resolution)
      .map(source => (
        <source key={source.resolution}
                src={source.url}
                type="video/webm"
                data-resolution={source.resolution} />
      ))}
  </video>

  {/* Listen mode visualizer */}
  {mode === 'listen' && (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-surface">
      <div className="flex items-end gap-1 h-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`w-1.5 bg-accent-mint rounded-full eq-bar-${i + 1}`} />
        ))}
      </div>
    </div>
  )}
</div>
```

### Watch/Listen Toggle

```tsx
<div className="flex gap-2 mt-4">
  <button onClick={() => setMode('watch')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold
            transition-colors duration-150
            ${mode === 'watch'
              ? 'bg-accent text-white'
              : 'bg-bg-elevated text-ktext-secondary border border-border-default'
            }`}>
    <Eye className="w-4 h-4" />
    Watch
  </button>
  <button onClick={() => setMode('listen')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold
            transition-colors duration-150
            ${mode === 'listen'
              ? 'bg-accent text-white'
              : 'bg-bg-elevated text-ktext-secondary border border-border-default'
            }`}>
    <Headphones className="w-4 h-4" />
    Listen
  </button>
</div>
```

---

### 8.8 RatingWidget

Two variants — use `variant="circles"` for user rating, `variant="bars"` for community display:

**Circles variant (Your Rating):**
```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <p className="text-xs font-body font-semibold text-ktext-secondary uppercase tracking-wide">Your Rating</p>
    {userRating && (
      <p className="text-xs font-body text-ktext-tertiary">Tap to score</p>
    )}
  </div>

  {/* Row 1: 1-5 */}
  <div className="flex gap-2">
    {[1,2,3,4,5].map(score => (
      <button key={score} onClick={() => onRate(score)}
              className={`flex-1 h-11 rounded-full font-mono font-bold text-sm
                transition-all duration-150 interactive
                ${userRating === score
                  ? 'text-white scale-110 shadow-accent-glow'
                  : 'bg-bg-elevated text-ktext-tertiary border border-border-default'
                }`}
              style={userRating === score ? { backgroundColor: getScoreColor(score) } : {}}
              aria-label={`Rate ${score} out of 10`}>
        {score}
      </button>
    ))}
  </div>
  {/* Row 2: 6-10 */}
  <div className="flex gap-2">
    {[6,7,8,9,10].map(score => (
      /* same as above */
    ))}
  </div>

  {userRating && (
    <button className="w-full h-12 bg-accent text-white rounded-full font-body font-semibold
                       interactive transition-colors duration-150 hover:bg-accent-hover">
      Confirm Rating
    </button>
  )}
</div>
```

**Bars variant (Community Score display — dark mode ThemePage):**
```tsx
<div className="bg-bg-elevated rounded-[16px] p-4 space-y-2">
  <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide">Community Score</p>
  <div className="flex items-end gap-1 h-12">
    {scoreDistribution.map((count, i) => (
      <div key={i}
           onClick={() => onRate(i + 1)}
           className="flex-1 rounded-t-sm cursor-pointer transition-all duration-150 hover:opacity-80"
           style={{
             height: `${(count / maxCount) * 48}px`,
             backgroundColor: i === (userRating - 1) ? 'var(--accent-mint)' : 'var(--bg-overlay)'
           }} />
    ))}
  </div>
  <p className="font-mono font-bold text-3xl text-ktext-primary">
    {avgRating.toFixed(1)} <span className="text-sm font-body text-ktext-tertiary">/ 10</span>
  </p>
  <p className="text-xs text-ktext-tertiary">Tap a bar to rate</p>
</div>
```

---

### 8.9 ProfileHeader

```tsx
<div className="flex flex-col items-center text-center pt-6 pb-4 space-y-4">
  {/* Avatar with glow ring */}
  <div className="relative">
    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent-mint ring-offset-2 ring-offset-bg-base">
      <img src={avatarUrl} className="w-full h-full object-cover" />
    </div>
    {isVerified && (
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full
                      bg-accent flex items-center justify-center border-2 border-bg-base">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
    )}
    {isOwn && (
      <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full
                         bg-accent-mint flex items-center justify-center border-2 border-bg-base">
        <Pencil className="w-3 h-3 text-on-accent-mint" />
      </button>
    )}
  </div>

  {/* Name + bio */}
  <div>
    <h1 className="text-2xl font-display font-bold text-ktext-primary">{displayName}</h1>
    <p className="text-sm font-body text-ktext-secondary mt-1 max-w-[240px]">{bio}</p>
  </div>

  {/* Action buttons */}
  {isOwn ? (
    <button className="px-8 h-11 bg-accent-container border border-border-accent
                       text-accent font-body font-semibold rounded-full interactive">
      Edit Profile
    </button>
  ) : (
    <div className="flex gap-3">
      <button className="px-6 h-11 bg-accent text-white font-body font-semibold rounded-full interactive">
        Follow
      </button>
      <button className="px-6 h-11 bg-bg-elevated border border-border-default
                         text-ktext-primary font-body font-semibold rounded-full interactive">
        Message
      </button>
    </div>
  )}

  {/* Stats row */}
  <div className="flex gap-3 w-full max-w-xs">
    {[
      { label: 'RATINGS', value: totalRatings },
      { label: 'FRIENDS', value: friends },
      { label: 'FOLLOWING', value: following },
    ].map(stat => (
      <div key={stat.label} className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
        <p className="text-xl font-display font-bold text-accent">{formatCount(stat.value)}</p>
        <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">{stat.label}</p>
      </div>
    ))}
  </div>
</div>
```

---

### 8.10 NotificationCard

```tsx
<div className="bg-bg-surface rounded-[16px] border border-border-subtle p-4 space-y-3 shadow-card">
  <div className="flex items-start gap-3">
    {/* Actor avatar with type badge */}
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-elevated">
        <img src={actorAvatar} className="w-full h-full object-cover" />
      </div>
      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                       flex items-center justify-center border-2 border-bg-surface
                       ${type === 'friend_request' ? 'bg-accent' : 'bg-accent-mint'}`}>
        {type === 'friend_request' && <UserPlus className="w-2.5 h-2.5 text-white" />}
        {type === 'friend_rated' && <Star className="w-2.5 h-2.5 text-white" />}
        {type === 'friend_favorited' && <Heart className="w-2.5 h-2.5 text-white" />}
      </div>
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-body text-ktext-primary leading-relaxed">
        <span className="font-semibold">{actorName}</span>{' '}
        {notificationText}
        {type === 'friend_rated' && (
          <span className="text-accent font-semibold"> {score}/10</span>
        )}
      </p>
      <p className="text-xs text-ktext-tertiary mt-1">{timeAgo}</p>
    </div>

    {/* Theme thumbnail for rated/favorited */}
    {(type === 'friend_rated' || type === 'friend_favorited') && themeImage && (
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-bg-elevated">
        <img src={themeImage} className="w-full h-full object-cover" />
      </div>
    )}

    {/* Favorite heart for favorited */}
    {type === 'friend_favorited' && (
      <Heart className="w-6 h-6 text-red-500 fill-red-500 flex-shrink-0" />
    )}
  </div>

  {/* Friend request actions */}
  {type === 'friend_request' && (
    <div className="flex gap-2 ml-15">
      <button className="flex-1 h-10 bg-accent text-white rounded-full font-body font-semibold text-sm interactive">
        Accept
      </button>
      <button className="flex-1 h-10 bg-bg-elevated border border-border-default
                         text-ktext-secondary rounded-full font-body font-semibold text-sm interactive">
        Decline
      </button>
    </div>
  )}
</div>
```

---

### 8.11 FriendCard

```tsx
<div className="flex items-center gap-3 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card">
  {/* Avatar + online dot */}
  <div className="relative flex-shrink-0">
    <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-elevated">
      <img src={avatarUrl} className="w-full h-full object-cover" />
    </div>
    {isOnline && (
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full
                      bg-green-500 border-2 border-bg-surface" />
    )}
  </div>

  {/* Name + bio */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-body font-semibold text-ktext-primary">{displayName}</p>
    <p className="text-xs font-body text-ktext-secondary truncate">{bio}</p>
  </div>

  {/* Actions */}
  <div className="flex items-center gap-2 flex-shrink-0">
    <button className="w-9 h-9 rounded-full bg-accent-container
                       flex items-center justify-center interactive">
      <MessageCircle className="w-4 h-4 text-accent" />
    </button>
    <button className="w-9 h-9 rounded-full bg-bg-elevated border border-border-default
                       flex items-center justify-center interactive">
      <MoreVertical className="w-4 h-4 text-ktext-tertiary" />
    </button>
  </div>
</div>
```

---

### 8.12 HistoryCard

```tsx
<div className="flex items-center gap-3 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card interactive cursor-pointer">
  {/* Image */}
  <div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
    <img src={animeCoverImage} className="w-full h-full object-cover" />
  </div>

  {/* Info */}
  <div className="flex-1 min-w-0">
    {/* Type badge */}
    <p className="text-[10px] font-body font-semibold tracking-wide uppercase
                  text-accent flex items-center gap-1 mb-1">
      {mode === 'watch' ? <Eye className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
      {type === 'OP' ? 'Opening Theme' : 'Ending Theme'}
    </p>
    <p className="text-sm font-body font-bold text-ktext-primary truncate">{songTitle}</p>
    <p className="text-xs font-body text-ktext-secondary italic truncate">{artistName}</p>
    <div className="flex items-center gap-3 mt-1 text-xs text-ktext-tertiary">
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {timeAgo}
      </span>
      {userRating && (
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          {userRating}/10
        </span>
      )}
    </div>
  </div>

  {/* Play button */}
  <button className="w-9 h-9 rounded-full bg-accent-container flex items-center justify-center flex-shrink-0 interactive">
    <Play className="w-4 h-4 text-accent" />
  </button>
</div>
```

Section dividers between date groups:
```tsx
<div className="flex items-center gap-3 my-4">
  <div className="flex-1 h-px bg-border-subtle" />
  <span className="text-xs font-body font-semibold tracking-[0.1em] uppercase text-ktext-tertiary">TODAY</span>
  <div className="flex-1 h-px bg-border-subtle" />
</div>
```

---

### 8.13 AnimePage Layout

```tsx
{/* Hero banner */}
<div className="relative h-56 md:h-72 overflow-hidden -mx-4 md:-mx-6">
  <img src={atGrillImage ?? bannerImage} className="w-full h-full object-cover object-top" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-base" />

  {/* Genre tags overlaid bottom-left */}
  <div className="absolute bottom-4 left-4 flex gap-2">
    {genres.slice(0, 2).map(genre => (
      <span key={genre} className="text-xs font-body font-semibold px-3 py-1 rounded-full
                                    bg-black/40 backdrop-blur-sm text-white border border-white/20">
        {genre.toUpperCase()}
      </span>
    ))}
  </div>
</div>

{/* Anime info */}
<div className="px-4 -mt-8 relative z-10">
  <h1 className="text-2xl font-display font-bold text-ktext-primary">{titleRomaji}</h1>
  <div className="flex items-center gap-4 mt-1 text-sm text-ktext-secondary">
    <span className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
      {(averageScore / 10).toFixed(1)} AniList
    </span>
    <span>·</span>
    <span>{totalEpisodes} Episodes</span>
  </div>
</div>

{/* Themes section */}
<div className="mt-6 bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Music className="w-4 h-4 text-accent" />
      <h2 className="text-base font-body font-semibold text-ktext-primary">Themes & Tracks</h2>
    </div>
  </div>

  <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide mb-2">Openings</p>
  {openingThemes.map(theme => (
    <ThemeListRow key={theme.slug} {...theme} />
  ))}

  <p className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide mb-2 mt-4">Endings</p>
  {endingThemes.map(theme => (
    <ThemeListRow key={theme.slug} {...theme} />
  ))}
</div>
```

---

### 8.14 ArtistPage Layout

```tsx
{/* Artist header */}
<div className="flex flex-col items-center text-center pt-6 space-y-4">
  <div className="relative">
    <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-accent-mint ring-offset-2 ring-offset-bg-base">
      <img src={artistImage} className="w-full h-full object-cover" />
    </div>
    {isVerified && (
      <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-accent
                      flex items-center justify-center border-2 border-bg-base">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
    )}
  </div>

  <div>
    <h1 className="text-3xl font-display font-extrabold text-ktext-primary tracking-tight uppercase">
      {artistName}
    </h1>
    <p className="text-sm font-body text-ktext-secondary mt-1">{tagline}</p>
  </div>

  {/* Stats */}
  <div className="flex gap-3 w-full max-w-xs">
    <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
      <p className="text-xl font-display font-bold text-accent">{formatCount(totalStreams)}</p>
      <p className="text-[10px] font-body text-ktext-tertiary tracking-wide uppercase">Total Streams</p>
    </div>
    <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
      <p className="text-xl font-display font-bold text-accent">#{globalRank}</p>
      <p className="text-[10px] font-body text-ktext-tertiary tracking-wide uppercase">Global Rank</p>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-3">
    <button className="px-8 h-11 bg-accent text-white rounded-full font-body font-semibold interactive">
      + Follow Artist
    </button>
    <button className="px-6 h-11 bg-bg-elevated border border-border-default
                       text-ktext-primary rounded-full font-body font-semibold interactive">
      Play Latest
    </button>
  </div>
</div>
```

---

### 8.15 Settings Page Layout

```tsx
{/* User card at top */}
<div className="bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card mb-4">
  <div className="flex items-center gap-3">
    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-accent-mint">
      <img src={avatarUrl} className="w-full h-full object-cover" />
    </div>
    <div>
      <p className="font-body font-semibold text-ktext-primary">{displayName}</p>
      <p className="text-xs font-body text-ktext-secondary">{userTag}</p>
      {isVerified && (
        <span className="text-[10px] font-body font-bold text-accent flex items-center gap-1 mt-1">
          <Check className="w-3 h-3" /> VERIFIED
        </span>
      )}
    </div>
  </div>
</div>

{/* Section: ACCOUNT */}
<p className="text-xs font-body font-semibold text-accent tracking-[0.1em] uppercase mb-2 px-1">Account</p>
<div className="bg-bg-surface rounded-[20px] border border-border-subtle shadow-card mb-4 overflow-hidden">
  {accountItems.map((item, i) => (
    <button key={item.label} className={`
      w-full flex items-center gap-3 p-4 interactive
      ${i < accountItems.length - 1 ? 'border-b border-border-subtle' : ''}
    `}>
      <div className="w-9 h-9 rounded-[10px] bg-accent-container flex items-center justify-center">
        <item.Icon className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-body font-medium text-ktext-primary">{item.label}</p>
        <p className="text-xs font-body text-ktext-tertiary">{item.subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-ktext-tertiary" />
    </button>
  ))}
</div>

{/* Section: NOTIFICATIONS */}
<p className="text-xs font-body font-semibold text-accent tracking-[0.1em] uppercase mb-2 px-1">Notifications</p>
<div className="bg-bg-surface rounded-[20px] border border-border-subtle shadow-card mb-4 overflow-hidden">
  {toggleItems.map((item, i) => (
    <div key={item.label} className={`
      flex items-center gap-3 p-4
      ${i < toggleItems.length - 1 ? 'border-b border-border-subtle' : ''}
    `}>
      <div className="w-9 h-9 rounded-[10px] bg-accent-container flex items-center justify-center">
        <item.Icon className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-body font-medium text-ktext-primary">{item.label}</p>
        {item.subtitle && <p className="text-xs font-body text-ktext-tertiary">{item.subtitle}</p>}
      </div>
      <Switch checked={item.enabled} onCheckedChange={item.onToggle} />
    </div>
  ))}
</div>

{/* Logout */}
<button className="w-full h-14 rounded-full font-body font-bold text-white
                   flex items-center justify-center gap-2 interactive mt-6"
        style={{ backgroundColor: 'var(--logout-bg)' }}>
  <LogOut className="w-4 h-4" />
  Logout from Kaikansen
</button>

<p className="text-center text-xs text-ktext-disabled mt-6 tracking-widest">
  VERSION 2.4.0-TIDE
</p>
```

---

### 8.16 Auth Page Layout

```tsx
{/* Full page with colored bg */}
<div className="min-h-screen flex flex-col items-center justify-center px-4
                bg-bg-base relative overflow-hidden">

  {/* Logo */}
  <div className="flex flex-col items-center gap-3 mb-8">
    <div className="w-14 h-14 rounded-[16px] bg-accent-container flex items-center justify-center">
      <span className="text-accent text-2xl">≋</span>
    </div>
    <div className="text-center">
      <h1 className="text-3xl font-display font-extrabold text-ktext-primary">Kaikansen</h1>
      <p className="text-xs font-body tracking-[0.2em] uppercase text-ktext-tertiary mt-1">
        The Ethereal Tide
      </p>
    </div>
  </div>

  {/* Auth card */}
  <div className="w-full max-w-sm bg-bg-surface rounded-[24px] border border-border-subtle p-6 shadow-modal">
    <h2 className="text-2xl font-display font-bold text-ktext-primary mb-1">Welcome back</h2>
    <p className="text-sm font-body text-ktext-secondary mb-6">
      Continue your journey through the tide.
    </p>

    {/* Inputs */}
    <div className="space-y-4 mb-6">
      <div>
        <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary mb-1.5 block">
          Email Address
        </label>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4
                        border border-border-default focus-within:border-border-accent
                        focus-within:ring-2 focus-within:ring-accent/20">
          <Mail className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
          <input type="email" placeholder="name@kaikansen.io"
                 className="flex-1 bg-transparent outline-none text-sm font-body
                            text-ktext-primary placeholder:text-ktext-disabled" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-body font-semibold tracking-wide uppercase text-ktext-tertiary">
            Password
          </label>
          <button className="text-xs font-body text-accent interactive">Forgot?</button>
        </div>
        <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-[12px] px-4
                        border border-border-default focus-within:border-border-accent">
          <Lock className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
          <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                 className="flex-1 bg-transparent outline-none text-sm font-body text-ktext-primary" />
          <button onClick={() => setShowPassword(!showPassword)} className="interactive rounded-full p-1">
            {showPassword ? <EyeOff className="w-4 h-4 text-ktext-tertiary" /> : <Eye className="w-4 h-4 text-ktext-tertiary" />}
          </button>
        </div>
      </div>
    </div>

    {/* CTA */}
    <button className="w-full h-12 bg-accent text-white rounded-full font-body font-semibold
                       flex items-center justify-center gap-2 interactive hover:bg-accent-hover
                       transition-colors duration-150">
      Sign In
      <ArrowRight className="w-4 h-4" />
    </button>

    <p className="text-center text-sm font-body text-ktext-secondary mt-4">
      Don't have an account?{' '}
      <Link to="/register" className="text-accent font-semibold interactive">Create one</Link>
    </p>
  </div>

  {/* Footer */}
  <div className="flex items-center gap-3 mt-8 text-xs font-body text-ktext-tertiary">
    <Link to="/privacy">PRIVACY</Link>
    <span>·</span>
    <Link to="/terms">TERMS</Link>
    <span>·</span>
    <span>© 2024 Kaikansen</span>
  </div>
</div>
```

---

### 8.17 ThemePage Layout (Full)

```tsx
<div className="pb-8">
  {/* Video player — full width, no horizontal padding */}
  <div className="-mx-4 md:-mx-6">
    <VideoPlayer
      videoSources={videoSources}
      poster={animeCoverImage ?? atCoverImage}
      mode={mode}
    />
  </div>

  {/* Watch/Listen toggle */}
  <div className="flex gap-2 mt-4 px-4">
    <WatchListenToggle mode={mode} onModeChange={setMode} />
  </div>

  {/* Song info */}
  <div className="px-4 mt-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-body font-semibold text-ktext-tertiary uppercase tracking-wide">
            Opening Theme {sequence > 1 ? `0${sequence}` : '01'} · Season {season}
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-ktext-primary leading-tight">{songTitle}</h1>
        <p className="text-sm font-body text-accent font-semibold mt-1">
          {artistName}
          {isVerified && <span className="ml-1">✓</span>}
        </p>
        <Link to={`/anime/${anilistId}`}
              className="text-xs font-body text-ktext-tertiary mt-0.5 hover:text-accent transition-colors">
          ∞ {animeTitle}
        </Link>
      </div>
      {/* Share button */}
      <button className="w-9 h-9 rounded-full bg-bg-elevated border border-border-default
                         flex items-center justify-center interactive flex-shrink-0">
        <Share2 className="w-4 h-4 text-ktext-secondary" />
      </button>
    </div>
  </div>

  {/* Community stats */}
  <div className="flex gap-3 mx-4 mt-4">
    <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
      <p className="text-xl font-mono font-bold text-ktext-primary"
         style={{ color: getScoreColor(Math.round(avgRating)) }}>
        {avgRating.toFixed(1)}
      </p>
      <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">AVG RATING</p>
    </div>
    <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
      <p className="text-xl font-mono font-bold text-ktext-primary">{formatCount(totalRatings)}</p>
      <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">RATINGS</p>
    </div>
    <div className="flex-1 bg-bg-elevated rounded-[16px] p-3 text-center">
      <p className="text-xl font-mono font-bold text-ktext-primary">{formatCount(totalWatches)}</p>
      <p className="text-[10px] font-body text-ktext-tertiary tracking-wide">WATCHES</p>
    </div>
  </div>

  {/* Rating widget */}
  <div className="mx-4 mt-4 bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card">
    <RatingWidget userRating={userRating} onRate={handleRate} />
  </div>

  {/* Lyrics preview */}
  {lyricsPreview && (
    <div className="mx-4 mt-4 bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-body font-semibold text-ktext-primary">Lyrics Preview</h3>
        <Music className="w-4 h-4 text-accent" />
      </div>
      <p className="text-base font-body font-semibold text-ktext-primary leading-relaxed">
        {lyricsPreview.japanese}
      </p>
      <p className="text-sm font-body text-ktext-secondary italic mt-2">
        "{lyricsPreview.english}"
      </p>
      <button className="text-xs font-body text-accent font-semibold mt-3 interactive flex items-center gap-1">
        View Full Transcript <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )}

  {/* Credits */}
  <div className="mx-4 mt-4 space-y-2">
    <h3 className="text-sm font-body font-semibold text-ktext-secondary uppercase tracking-wide">Production</h3>
    {credits.map(credit => (
      <div key={credit.role} className="flex items-center gap-3 bg-bg-surface
                                        rounded-[12px] p-3 border border-border-subtle">
        <div className="w-8 h-8 rounded-full bg-accent-container flex items-center justify-center">
          <Mic className="w-3.5 h-3.5 text-accent" />
        </div>
        <div>
          <p className="text-[10px] font-body text-ktext-tertiary uppercase tracking-wide">{credit.role}</p>
          <p className="text-sm font-body font-semibold text-ktext-primary">{credit.name}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Quick actions */}
  <div className="mx-4 mt-4 space-y-1">
    {[
      { icon: Plus, label: 'Add to Library' },
      { icon: Share2, label: 'Share Theme' },
      { icon: AlertCircle, label: 'Report Issues' },
    ].map(action => (
      <button key={action.label}
              className="w-full flex items-center gap-3 p-4 rounded-[12px] interactive
                         text-ktext-secondary hover:text-ktext-primary transition-colors">
        <action.icon className="w-5 h-5" />
        <span className="text-sm font-body font-medium">{action.label}</span>
      </button>
    ))}
  </div>
</div>
```

---

### 8.18 Home Page Layout

```tsx
<div className="space-y-6 pt-4">
  {/* Section: Featured (current season horizontal scroll) */}
  <section>
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs font-body font-semibold text-accent uppercase tracking-wide">Current Season</p>
        <h2 className="text-2xl font-display font-bold text-ktext-primary">Winter 2026</h2>
      </div>
      <Link to={`/season/winter/2026`}
            className="text-sm font-body text-accent font-semibold interactive">
        View All
      </Link>
    </div>

    {/* Horizontal scroll of featured cards */}
    <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
      {featuredThemes.map(theme => (
        <ThemeFeaturedCard key={theme.slug} {...theme} />
      ))}
    </div>
  </section>

  {/* Section: Friends Activity (logged in + has friends only) */}
  {isLoggedIn && friendActivity.length > 0 && (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-display font-bold text-ktext-primary">👥 Friends Activity</h2>
        <Link to="/friends" className="text-sm font-body text-accent font-semibold interactive">
          See all
        </Link>
      </div>
      <div className="space-y-2">
        {friendActivity.slice(0, 5).map(activity => (
          <ThemeListRow key={`${activity.userId}-${activity.themeSlug}`}
                        {...activity.theme}
                        friendUsername={activity.username}
                        friendScore={activity.score} />
        ))}
      </div>
    </section>
  )}

  {/* Section: Popular Themes */}
  <section>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-display font-bold text-ktext-primary">🔥 Popular Themes</h2>
      {/* OP / ED toggle */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-full">
        {(['OP', 'ED'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                  className={`h-7 px-3 rounded-full text-xs font-body font-bold transition-colors duration-150 interactive
                    ${typeFilter === t
                      ? 'bg-accent text-white'
                      : 'text-ktext-secondary hover:text-ktext-primary'
                    }`}>
            {t}
          </button>
        ))}
      </div>
    </div>

    {/* Infinite scroll list */}
    <div className="space-y-2">
      {popularThemes.map(theme => (
        <ThemeListRow key={theme.slug} {...theme} />
      ))}
    </div>

    {/* Load more sentinel */}
    <div ref={loadMoreRef} className="h-8" />
  </section>

  {/* Stats footer (dark mode only shows this) */}
  <div className="flex gap-3">
    <div className="flex-1 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card">
      <TrendingUp className="w-5 h-5 text-accent mb-1" />
      <p className="text-xs font-body text-ktext-tertiary uppercase tracking-wide">Active Users</p>
      <p className="text-xl font-display font-bold text-ktext-primary">{formatCount(activeUsers)}</p>
    </div>
    <div className="flex-1 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card">
      <div className="flex items-center gap-1 mb-1">
        {listeningAvatars.slice(0, 3).map((a, i) => (
          <img key={i} src={a} className="w-5 h-5 rounded-full -ml-1 first:ml-0 border border-bg-surface" />
        ))}
        <span className="text-xs text-ktext-tertiary ml-1">+{listeningCount - 3}</span>
      </div>
      <p className="text-xs font-body text-ktext-tertiary uppercase tracking-wide">Listening Now</p>
      <p className="text-xl font-display font-bold text-ktext-primary">{listeningNow}</p>
    </div>
  </div>
</div>
```

---

### 8.19 Search Page Layout

```tsx
<div className="pt-4 space-y-4">
  {/* Search bar */}
  <div className="flex items-center gap-3 h-12 bg-bg-elevated rounded-full px-4
                  border border-border-default focus-within:border-border-accent
                  focus-within:ring-2 focus-within:ring-accent/20">
    <Search className="w-4 h-4 text-ktext-tertiary flex-shrink-0" />
    <input value={query} onChange={e => setQuery(e.target.value)}
           placeholder="Search songs, artists, anime…"
           className="flex-1 bg-transparent outline-none text-sm font-body
                      text-ktext-primary placeholder:text-ktext-tertiary" />
    {query && (
      <button onClick={clearQuery} className="interactive rounded-full p-1">
        <X className="w-4 h-4 text-ktext-tertiary" />
      </button>
    )}
  </div>

  {/* Filter chips: All Results · Song · Singer · Anime */}
  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
    {filters.map(filter => (
      <button key={filter.value} onClick={() => setFilter(filter.value)}
              className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-body font-medium
                transition-colors duration-150 interactive
                ${activeFilter === filter.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface border border-border-default text-ktext-secondary'
                }`}>
        {filter.label}
      </button>
    ))}
  </div>

  {/* Results: image left, text right rows */}
  {results.length > 0 && (
    <div className="space-y-2">
      {results.map(theme => (
        <ThemeListRow key={theme.slug} {...theme} />
      ))}
    </div>
  )}
</div>
```

---

## 9. SPACING SYSTEM

| Context | Value |
|---|---|
| Page horizontal padding | `px-4` → `md:px-6` → `lg:px-8` |
| Page top padding | `pt-4` |
| Section gap | `space-y-6` |
| Card inner padding | `p-4` |
| List row gap | `space-y-2` |
| Grid gap | `gap-3` → `md:gap-4` |
| Chip/badge gap | `gap-2` |
| Icon (nav) | `w-6 h-6` |
| Icon (inline) | `w-4 h-4` |
| Min touch target | `min-h-11 min-w-11` (44px) |
| Bottom nav height | `h-16` |

---

## 10. IMAGE TREATMENT

```tsx
/* Anime cover — square for list rows */
<div className="w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-bg-elevated">
  <img src={atCoverImage ?? animeCoverImage} className="w-full h-full object-cover"
       loading="lazy" alt={animeTitle} />
</div>

/* Featured card — 16:9 landscape */
<div className="aspect-video rounded-[20px] overflow-hidden bg-bg-elevated">
  <img src={atCoverImage ?? animeCoverImage} className="w-full h-full object-cover" loading="lazy" />
</div>

/* Grill/Banner — wide hero */
<div className="relative h-56 overflow-hidden">
  <img src={atGrillImage ?? bannerImage ?? animeCoverImage}
       className="w-full h-full object-cover object-top" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-base" />
</div>

/* Image fallback chain — always use this priority:
   1. atCoverImage (AnimeThemes Cover)
   2. animeCoverImage (from AnimeCache — AniList)
   3. placeholder bg-bg-elevated
*/
```

---

## 11. ANIMATION SYSTEM

### Easing: `cubic-bezier(0.2, 0, 0, 1)` — M3 standard

```css
/* globals.css */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 220ms cubic-bezier(0.2, 0, 0, 1) forwards; }

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
.scale-in { animation: scaleIn 250ms cubic-bezier(0.2, 0, 0, 1) forwards; }

/* Stagger list items */
.stagger > * { opacity: 0; }
.stagger > *:nth-child(1) { animation: fadeUp 220ms 0ms   cubic-bezier(0.2,0,0,1) forwards; }
.stagger > *:nth-child(2) { animation: fadeUp 220ms 40ms  cubic-bezier(0.2,0,0,1) forwards; }
.stagger > *:nth-child(3) { animation: fadeUp 220ms 80ms  cubic-bezier(0.2,0,0,1) forwards; }
.stagger > *:nth-child(4) { animation: fadeUp 220ms 120ms cubic-bezier(0.2,0,0,1) forwards; }
.stagger > *:nth-child(5) { animation: fadeUp 220ms 160ms cubic-bezier(0.2,0,0,1) forwards; }

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 0%,
    var(--bg-overlay)  50%,
    var(--bg-elevated) 100%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}

/* Listen mode equalizer bars */
@keyframes eq1 { 0%,100%{height:6px}  50%{height:20px} }
@keyframes eq2 { 0%,100%{height:14px} 50%{height:6px}  }
@keyframes eq3 { 0%,100%{height:20px} 50%{height:14px} }
@keyframes eq4 { 0%,100%{height:6px}  50%{height:18px} }
.eq-bar-1 { animation: eq1 0.8s ease-in-out infinite; }
.eq-bar-2 { animation: eq2 0.9s ease-in-out infinite; }
.eq-bar-3 { animation: eq3 1.0s ease-in-out infinite; }
.eq-bar-4 { animation: eq4 0.7s ease-in-out infinite; }
.eq-bar-5 { animation: eq1 1.1s ease-in-out infinite; }
.eq-bar-6 { animation: eq2 0.85s ease-in-out infinite; }
.eq-bar-7 { animation: eq3 0.95s ease-in-out infinite; }
.eq-bar-8 { animation: eq4 0.75s ease-in-out infinite; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. SCORE UTILITIES

```typescript
// /client/src/lib/utils.ts

export function getScoreColor(score: number): string {
  if (score >= 9)  return '#10b981'
  if (score >= 7)  return '#22c55e'
  if (score >= 6)  return '#84cc16'
  if (score >= 5)  return '#eab308'
  if (score >= 4)  return '#f97316'
  return '#ef4444'
}

export function getScoreLabel(score: number): string {
  const labels: Record<number, string> = {
    10: 'Masterpiece', 9: 'Excellent', 8: 'Great',
    7:  'Good',        6: 'Fine',      5: 'Average',
    4:  'Below Avg',   3: 'Bad',       2: 'Terrible', 1: 'Unwatchable'
  }
  return labels[score] ?? '—'
}

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function timeAgo(date: Date | string): string {
  // "2 hours ago", "Yesterday", "Mar 24"
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  // clsx + tailwind-merge
}
```

---

## 13. MOBILE-SPECIFIC RULES

- All interactive elements: `min-h-11 min-w-11` (44px) — non-negotiable
- Bottom nav: `h-16` + `pb-[env(safe-area-inset-bottom)]`
- Page content: `pb-20 md:pb-0`
- Horizontal scrolls: `overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2`
- Video: always `playsInline` on `<video>` — required for iOS
- Listen mode: keep `<video>` in DOM but `className="hidden"` — audio continues
- Font sizes: minimum `text-sm` (14px) for body copy, never smaller

---

## 14. ACCESSIBILITY

- All icon-only buttons have `aria-label`
- Rating buttons: `aria-label="Rate {score} out of 10"`
- Score displays: `aria-label="Community score: {score} from {count} ratings"`
- Bottom nav: `role="link"` + `aria-current="page"` on active
- Focus rings: `.interactive:focus-visible` with 2px accent outline
- Color contrast: text-primary on bg-surface ≥ 7:1 (light) / ≥ 7:1 (dark)
- Scores always shown with label, never color-only

---

## 15. AGENT PROMPT CHEAT SHEET

```
Apply the Kaikansen Tidal UI design system:
- Use CSS variables (var(--token)) for all colors — never hardcode hex values
- .interactive class on ALL clickable surfaces
- rounded-[20px] for cards, rounded-[16px] for list rows, rounded-full for pills
- Image fallback chain: atCoverImage → animeCoverImage (AniList)
- Grill image fallback: atGrillImage → bannerImage → animeCoverImage
- Bottom nav: flex md:hidden | Navigation Rail: hidden md:flex
- Min touch target: min-h-11 on every interactive element
- Dark mode: use .dark class or [data-theme="dark"]
- Dark mode header: rounded-b-[24px]
- Section labels: text-xs uppercase tracking-wide text-ktext-tertiary (light) / text-accent (dark)
- OP badge: bg-accent-container text-accent
- ED badge: bg-accent-ed-container text-accent-ed
- Score colors: use getScoreColor() from utils.ts
- Logout button: var(--logout-bg) — teal in light, crimson in dark
```

**Token quick-reference:**
```
bg-bg-base        → page background
bg-bg-surface     → cards, panels
bg-bg-elevated    → inputs, hover states
accent            → primary interactive (dark teal light / mint teal dark)
accent-mint       → badges, active indicators
accent-container  → chip/indicator bg
accent-ed         → ED themes, peach color
ktext-primary     → headings, titles
ktext-secondary   → subtitles, artists
ktext-tertiary    → timestamps, metadata
border-default    → card borders
border-accent     → focused/selected
```

---

## 16. EXACT MOBILE LAYOUTS (Screen-by-Screen)

> Pixel-accurate specs from design mockups.
> All measurements assume 390px wide (iPhone 14 Pro viewport).
> Use these as ground truth when building each screen.

---

### 16.1 HOME PAGE — Mobile Layout

#### Light Mode Flow (top → bottom)

```
┌─────────────────────────────────────────┐  h=56px
│  ☰  Kaikansen              [avatar 36px]│  bg: #FFFFFF
│  (hamburger)  (text-accent font-display)│  border-b: border-border-subtle
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐  pt-16px
│  CURRENT SEASON          ← text-xs      │  color: #0A8A96 (accent)
│  Winter 2026   View All →               │  "Winter 2026": text-2xl font-display font-bold
│                          ← text-accent  │  "View All": text-sm text-accent
└─────────────────────────────────────────┘  gap: 8px

FEATURED STRIP (horizontal scroll, -mx-4 px-4)
┌──────────────────────┐ ┌────────────────
│  [image 75vw × 48vw] │ │ [image partial]
│  rounded-[20px]      │ │ rounded-[20px]
│  ┌──────────────┐    │ │
│  │ ★ 9.1        │    │ │  ← score: bg-black/50
│  └──────────────┘    │ │    backdrop-blur rounded-full
│                      │ │    px-2 py-1 text-xs font-mono
│  Oshi no Ko: S3 ─────┘ │  ← title: text-sm font-bold white
│  Doga Kobo      ─────┘ │  ← studio: text-xs white/70
└──────────────────────┘   gap: 12px between cards
                           pb-8px scroll indicator space

─────────────────────────────────────────  mt-24px
Popular Themes         [OP] [ED]            "Popular Themes": text-xl font-display font-bold
                                            Toggle: bg-bg-elevated rounded-full p-1
                                            Active tab: bg-accent text-white rounded-full h-7 px-3
                                            Inactive: text-ktext-secondary text-xs font-bold

POPULAR LIST ROWS (space-y-2, mt-12px)
┌─────────────────────────────────────────┐  h=auto min-h-[80px]
│ ┌──────┐  ┌─OP ─┐  ★ 9.4               │  bg: #FFFFFF rounded-[16px]
│ │      │  │ OP  │                        │  border: 1px border-border-subtle
│ │ img  │  └─────┘                        │  shadow: 0 2px 12px rgba(10,138,150,0.08)
│ │ 64px │  Idol                           │  px-12px py-12px gap-12px
│ │      │  YOASOBI                        │
│ │      │  Oshi no Ko: Season 3           │  Image: w-16 h-16 rounded-[12px]
│ └──────┘                     [▶ circle]  │  OP badge: bg-accent-container text-accent
└─────────────────────────────────────────┘    text-[10px] font-mono font-bold rounded-full px-1.5 py-0.5
                                               ED badge: bg-accent-ed-container text-accent-ed
                                               Song: text-sm font-semibold text-ktext-primary
                                               Artist: text-xs text-ktext-secondary
                                               Anime: text-xs text-ktext-tertiary italic
                                               ★: w-3 h-3 text-yellow-500 fill-yellow-500
                                               Score: text-xs font-mono font-bold text-ktext-secondary
                                               Play btn: w-9 h-9 rounded-full bg-accent-container

FAB (Floating Action Button) — fixed bottom-right
[↗ circle]  w-14 h-14 bg-accent rounded-full shadow-accent-glow  bottom-20 right-4

BOTTOM NAV
┌────────────────────────────────────────┐  h=64px + safe-area
│  [🏠]Home  [🔍]Search [🔔]Alerts [👤]│  bg: #FFFFFF
│  ┌──────┐                              │  border-top: 1px border-border-subtle
│  │  🏠  │  ← active: large teal pill  │
│  │ Home │    w-20 h-10 rounded-full   │  Active: bg-accent-mint (mint #4ECDC4) behind icon
│  └──────┘    bg-accent-mint           │  Active icon + label: text-accent
└────────────────────────────────────────┘  Label: text-[10px] font-body
```

**Light mode colors exact:**
- Page bg: `#E8F4F7`
- Header bg: `#FFFFFF`
- Cards: `#FFFFFF`
- "CURRENT SEASON" label: `#0A8A96`
- "Winter 2026": `#0D1B2A`
- "View All": `#0A8A96`
- OP badge bg: `rgba(10,138,150,0.12)` text: `#065962`
- ED badge bg: `rgba(240,160,90,0.15)` text: `#5C3200`
- Bottom nav active pill: `#4ECDC4` (mint)

---

#### Dark Mode Flow (top → bottom)

```
┌─────────────────────────────────────────┐  h=56px  ROUNDED BOTTOM CORNERS
│  ≋  Ethereal Tide    [🔍] [avatar 40px]│  bg: #0A1828  rounded-b-[24px]
└─────────────────────────────────────────┘  No border — shadow only

┌─────────────────────────────────────────┐  pt-20px (extra for rounded header offset)
│  Winter 2026    [New Season pill]       │  "Winter 2026": text-3xl font-display font-bold #FFFFFF
│                                         │  "New Season": text-xs bg-accent-container text-accent
└─────────────────────────────────────────┘    rounded-full px-3 py-1 border border-border-accent

FEATURED STRIP (same scroll behavior)
Cards: bg-bg-surface (#0C1C28) rounded-[20px]
Genre tag overlaid bottom-left: bg-black/40 backdrop-blur text-white border-white/20
Title: text-xl font-display font-bold text-white
Characters/art shown as full-bleed image

─────────────────────────────────────────  mt-28px
Popular Themes             [OP] [ED]       "Popular Themes": text-xl font-bold #FFFFFF
                                           Toggle container: bg-bg-elevated rounded-full
                                           Active: bg-accent-mint (#4ECDC4) text-[#063E3A]
                                           Inactive: text-[#7AAAB8] text-xs

DARK LIST ROWS
┌─────────────────────────────────────────┐  bg: #0C1C28 (bg-surface)
│ ┌──────┐  Shinkai no Waltz              │  rounded-[16px] border border-border-subtle
│ │      │  Eternal Resonance • OP1       │  p-12px gap-12px
│ │ img  │  [4K] [NC]  ← quality pills   │
│ │ 64px │                    [▶ circle] │  Quality pills: bg-bg-overlay text-ktext-tertiary
│ └──────┘                               │    text-[10px] font-mono rounded-full px-1.5 py-0.5
└─────────────────────────────────────────┘    border border-border-subtle

STATS FOOTER (2 cards, mt-24px)
┌─────────────────────┐ ┌─────────────────────┐  h=100px
│  [↗ icon]           │ │  [avatar stack +24] │  bg: #0C1C28 rounded-[20px]
│  ACTIVE USERS       │ │  LISTENING NOW      │  gap: 12px
│  12.8k              │ │  432                │  Label: text-[10px] uppercase tracking-wide
└─────────────────────┘ └─────────────────────┘    text-[#4ECDC4] (accent-mint)
                                                   Number: text-2xl font-display font-bold #FFFFFF
                                                   Avatar stack: overlapping circles, +24 text

BOTTOM NAV (dark)
┌────────────────────────────────────────┐  h=64px
│ [💧] [🔍] [🔔●] [👤]                 │  bg: #0C1C28 NO top border
│ ┌───────────────┐  ← active: large    │
│ │  💧  Home     │    oval pill        │  Active: large rounded-full bg-accent-container
└─────────────────────────────────────────┘   w-20 h-10, icon + label centered inside
                                             Bell: red dot overlay top-right if unread
                                             Inactive icons: #4A6878 (text-tertiary dark)
```

**Dark mode colors exact:**
- Page bg: `#070F18`
- Header bg: `#0A1828` rounded-b-[24px]
- Cards: `#0C1C28`
- Section labels: `#4ECDC4` (mint teal)
- Numbers/stats: `#4ECDC4`
- Quality pill bg: `#162840`
- Bottom nav active pill: `rgba(78,205,196,0.15)` with mint icon

---

### 16.2 SEARCH PAGE — Mobile Layout

#### Light Mode
```
HEADER: same as home
─────────────────────────────────────────

SEARCH BAR (mt-16px)
┌─────────────────────────────────────────┐  h=48px
│  🔍  Search for themes, artists…  [✕] │  bg: #FFFFFF rounded-full
└─────────────────────────────────────────┘  border: 1px border-border-default
                                             focus: border-border-accent ring-2 ring-accent/20
                                             shadow: 0 2px 8px rgba(10,138,150,0.10)
                                             icon: text-ktext-tertiary w-4 h-4

FILTER CHIPS (mt-12px, overflow-x-auto)
[All Results] [Song] [Singer] [Anime]      horizontal scroll gap-8px
Active: bg-accent text-white rounded-full h-9 px-4 text-sm font-medium
Inactive: bg-bg-surface border border-border-default text-ktext-secondary rounded-full

RESULTS LIST (mt-16px, space-y-2)
Same ThemeListRow format as home popular:
┌─────────────────────────────────────────┐
│ ┌──────┐  [OPENING badge]   ★ 4.9      │  OPENING/ENDING badge: light version
│ │      │  Gurenge           ♥           │  Favorite heart right side (not play button)
│ │ img  │  LiSA • Demon Slayer           │  Duration: 🕐 3:58
│ │ 64px │  🕐 3:58   ★ 4.9              │
│ └──────┘                               │
└─────────────────────────────────────────┘
```

**Key differences from home list rows:**
- Search results show heart (favorite) icon instead of play button on right
- Duration (clock icon + time) shown inline with rating
- OPENING/ENDING text badge (not OP/ED number abbreviation)
- Badge colors:
  - OPENING: `bg-accent-container` `text-accent` rounded-full
  - ENDING: `bg-accent-ed-container` `text-accent-ed` rounded-full

#### Dark Mode Search
```
SEARCH BAR: bg-bg-elevated (#112233) rounded-full border border-border-default
Placeholder: text-ktext-tertiary (#4A6878)
Active filter chip: bg-accent (#4ECDC4) text-on-accent (#063E3A)
Inactive chip: bg-bg-elevated border border-border-subtle text-ktext-secondary

RESULTS: same rows but dark card bg-bg-surface (#0C1C28)
"Recent Discoveries" section heading above results: text-xl font-bold #FFFFFF mt-24px
Result rows have NO card background in dark mode — just divider lines
Image: w-20 h-16 (slightly wider) rounded-[12px]
Category labels (RARE FINDING, STABLE HABITAT etc): all caps text-[10px]
  Teal: #4ECDC4, Red: #F87171, Gray: #7AAAB8, Purple: #A78BFA
```

---

### 16.3 THEME PAGE — Mobile Layout

#### Light Mode Flow
```
HEADER (no hamburger — back arrow instead)
┌─────────────────────────────────────────┐
│  ← (back)  [empty]    [🔍] [share]     │  bg: #FFFFFF h=56px
└─────────────────────────────────────────┘

VIDEO PLAYER (-mx-4, full bleed width)
┌─────────────────────────────────────────┐  aspect-video (16:9)
│                                         │  rounded-[20px] overflow-hidden
│           [▶ play button               │  Poster: animeCoverImage cover
│            large circle 64px           │  Play btn: w-16 h-16 bg-white/30
│            bg-white/30]                │    backdrop-blur rounded-full
│                                         │  Timestamp: bottom-left text-xs text-white
│  04:20 / 08:58                 [ ⛶ ]  │  Fullscreen: bottom-right
└─────────────────────────────────────────┘

WATCH/LISTEN TOGGLE (mt-16px)
[▶ Watch]  [🎧 Listen]                    Active: bg-accent text-white rounded-full h-10 px-5
                                           Inactive: bg-bg-elevated border text-ktext-secondary rounded-full
                                           gap-8px

SONG INFO (mt-16px px-4)
Opening Theme 01 · Season 1               text-xs text-ktext-tertiary uppercase tracking-wide
Sparkle (Movie Ver.)                      text-2xl font-display font-bold text-ktext-primary
RADWIMPS ✓                                text-sm text-accent font-semibold
∞ Kimi no Na wa.                          text-xs text-ktext-tertiary (link to anime page)

STATS ROW (mt-12px, 3 cards)
┌──────────┐ ┌──────────┐ ┌──────────┐   h=72px gap-8px
│   9.4    │ │  12.8k   │ │   45k    │   bg: bg-bg-elevated rounded-[16px]
│ AVG      │ │ RATINGS  │ │ WATCHES  │   Number: text-xl font-mono font-bold
│ RATING   │ │          │ │          │   Label: text-[10px] uppercase tracking-wide
└──────────┘ └──────────┘ └──────────┘     text-ktext-tertiary
AVG RATING number colored by getScoreColor()

YOUR RATING (mt-16px bg-bg-surface rounded-[20px] p-16px shadow-card)
YOUR RATING      ← text-xs uppercase tracking-wide text-ktext-secondary
Tap to score     ← text-xs text-ktext-tertiary right-aligned

Row 1: [1][2][3][4][5]                    5 buttons per row
Row 2: [6][7][8][9][10]                   gap-8px
Each btn: flex-1 h-11 rounded-full font-mono font-bold text-sm
  Unselected: bg-bg-elevated text-ktext-tertiary border border-border-default
  Selected: colored fill + text-white scale-110 shadow-accent-glow

[Confirm Rating]  ← mt-12px full-width h-12 bg-accent text-white rounded-full
                     only visible after selection

LYRICS PREVIEW (mt-12px)
┌─────────────────────────────────────────┐  bg-bg-surface rounded-[20px] p-16px
│ Lyrics Preview              🎵          │  Header: text-sm font-semibold + icon
│                                         │
│ Tsuyoku nareru riyuu wo shitta          │  Japanese: text-base font-semibold
│ Boku wo tsurete susume…                 │    text-ktext-primary leading-relaxed
│                                         │
│ "I found the reason why I can become    │  English: text-sm italic text-ktext-secondary
│  strong. Carry me with you…"            │
│                                         │
│ View Full Transcript →                  │  text-xs text-accent font-semibold
└─────────────────────────────────────────┘

CREDITS (mt-12px space-y-8px)
PRODUCTION      ← text-xs uppercase tracking-wide text-ktext-secondary

┌─────────────────────────────────────────┐  h=52px
│ [🎤 circle]  Vocals                    │  Circle: w-8 h-8 bg-accent-container rounded-full
│               LiSA                     │  Role: text-[10px] uppercase text-ktext-tertiary
└─────────────────────────────────────────┘  Name: text-sm font-semibold text-ktext-primary

QUICK ACTIONS (mt-12px)
[ + ] Add to Library
[ ↗ ] Share Theme
[ ! ] Report Issues
Each: w-full flex items-center gap-12px p-16px text-sm text-ktext-secondary rounded-[12px]
```

#### Dark Mode ThemePage
```
HEADER: bg-bg-header (#0A1828) rounded-b-[24px]
  Left: ≋ Ethereal Tide (italic font-display)
  Right: 🔍 icon + avatar circle

VIDEO PLAYER: Same dimensions, dark bg-bg-surface (#0C1C28) outside
  Timestamp: absolute bottom-left text-xs text-white
  Play button: same white/30 circle

WATCH/LISTEN:
  Watch (active): bg-accent-mint (#4ECDC4) text-on-accent (#063E3A) rounded-full h-10
  Listen (inactive): plain text text-ktext-secondary, NO border/bg

SONG TITLE: text-3xl font-display font-bold text-white (larger than light)
ARTIST: text-accent-mint (#4ECDC4) font-semibold + ✓ verified badge

RATING CARD (dark variant):
  bg: rgba(78,205,196,0.05) border border-border-subtle rounded-[16px]
  Label: "RATE THIS EXPERIENCE" text-[10px] uppercase text-ktext-tertiary
  Bar chart visualization (NOT circle buttons in dark Variant A):
    8 vertical bars, varying heights, teal accent on selected
    Large score: text-4xl font-mono font-bold text-accent-mint "9.4 / 10"
    Below bars: text-sm text-ktext-tertiary "Tap a bar to rate"

  Or circle buttons (Variant B — use based on context)

STATS (2 cards row):
  bg-bg-elevated rounded-[16px]
  Icon: users/trophy icon in teal
  Number: text-2xl font-display font-bold text-ktext-primary
  Label: text-[10px] uppercase text-ktext-tertiary

"Echoes & Reactions" section (v2 feature but shown in dark mockup):
  Dark card, quote text in italic, avatar + username + time
  Heart count (♥) + comment count (💬)

RELATED CHIPS (bottom of page):
  [● Dream Lantern]  [Nandemonaiya]  [Zenzenzense]  [Weathering With You]
  Active: bg-accent text-white rounded-full h-8 px-3 flex items-center gap-1.5
  "● " dot prefix on active chip = live/playing indicator
  Inactive: bg-bg-elevated text-ktext-secondary rounded-full border border-border-subtle
```

---

### 16.4 NOTIFICATIONS PAGE — Mobile Layout

#### Light Mode
```
HEADER:
┌─────────────────────────────────────────┐
│  ≋  Notifications    Mark all as read  │  "Mark all as read": text-sm text-accent
└─────────────────────────────────────────┘    right-aligned, only if unread > 0

NOTIFICATION CARDS (space-y-12px mt-16px)

Friend Request card:
┌─────────────────────────────────────────┐  bg-bg-surface rounded-[20px] p-16px
│ ┌──────────┐  Aoi Tanaka      2m ago    │  shadow-card border border-border-subtle
│ │  avatar  │  sent you a friend         │
│ │  48px    │  request                   │  Avatar: w-12 h-12 rounded-full
│ │   [+]    │                            │  Badge overlay: w-5 h-5 bg-accent
│ └──────────┘                            │    rounded-full bottom-0 right-0
│                                         │    UserPlus icon w-2.5 h-2.5 text-white
│  ┌──────────────────┐ ┌──────────────┐  │
│  │     Accept       │ │   Decline    │  │  Accept: bg-accent text-white rounded-full h-10 flex-1
│  └──────────────────┘ └──────────────┘  │  Decline: bg-bg-elevated border rounded-full h-10 flex-1
└─────────────────────────────────────────┘    gap-8px  mt-12px

Rated notification card:
┌─────────────────────────────────────────┐
│ ┌──────────┐  Kenji rated              │  Avatar + star badge (yellow/teal star icon)
│ │  avatar  │  Sparkle (Movie Ver.)     │  Song name: text-accent italic font-semibold
│ │  48px    │  a  [9/10]  ← score pill │  Score pill: bg-accent-container text-accent
│ │   [★]   │                      [🖼]  │    rounded-full px-2 py-0.5 font-mono font-bold
│ └──────────┘  1h ago                   │  Theme thumbnail: w-10 h-10 rounded-full right side
└─────────────────────────────────────────┘

Favorited notification:
Similar structure, heart icon (♥ filled red) right side instead of thumbnail

System notification:
  Icon: teal circle with ✨ sparkles icon (no avatar)
  Text: smaller, muted
  No action buttons
```

#### Dark Mode Notifications
```
HEADER: bg-bg-header rounded-b-[24px]
  Title: text-2xl font-display font-bold #FFFFFF
  "Mark all as read": text-sm text-accent-mint

NOTIFICATION CARDS: bg-bg-surface (#0C1C28) rounded-[20px]
  Border: border-border-subtle
  Unread cards: slightly lighter bg bg-bg-elevated + left border 3px accent-mint

Friend request:
  "You have 12 mutual friends in the bioluminescent community."  ← longer copy in dark
  Accept btn: bg-accent-mint text-on-accent rounded-full h-10
  Decline btn: border border-border-strong text-ktext-primary rounded-full h-10

Rating notification:
  Score highlight: text-accent-mint (#4ECDC4) font-semibold "5 stars"

OLDER NOTIFICATIONS section divider:
  "OLDER NOTIFICATIONS" text-[10px] uppercase tracking-[0.15em] text-ktext-tertiary
  Full-width horizontal line: bg-border-subtle h-px
  Items below: NO card bg, just avatar + text, slightly smaller, less contrast
```

---

### 16.5 FRIENDS / CONNECTIONS PAGE — Mobile Layout

#### Light Mode (from screenshots)
```
HEADER: standard white header

PAGE CONTENT (not inside header)
Connections ← text-3xl font-display font-bold text-accent (teal, large)
[👤+ Add Friend] ← bg-accent text-white rounded-full h-11 px-5 float-right

TABS (mt-16px)
Friends | Requests [3]              Full-width tab row
Active: text-accent, teal underline h-[2px] bg-accent
Inactive: text-ktext-secondary
"Requests" badge: small rounded circle bg-accent text-white text-[10px] ml-1

FRIEND LIST (mt-16px space-y-8px)
┌─────────────────────────────────────────┐  h=72px (or taller with tagline)
│ ┌──────────┐  Kenji                     │  bg-bg-surface rounded-[24px] (extra rounded)
│ │  avatar  │  Melody Enthusiast         │  border border-border-subtle
│ │  48px    │                 [💬] [⋮] │  shadow-card  px-16px
│ │   🟢    │  ← green online dot        │
│ └──────────┘                            │  Avatar: w-12 h-12 rounded-full
└─────────────────────────────────────────┘  Online dot: w-3 h-3 bg-green-500
                                             Chat btn: w-9 h-9 bg-accent-container rounded-full
                                               MessageSquare icon text-accent
                                             More btn: w-9 h-9 bg-bg-elevated border rounded-full
                                               MoreVertical icon text-ktext-tertiary

PENDING REQUESTS section (within Friends tab if any)
"YOUR CIRCLE" / "PENDING REQUESTS" ← text-xs uppercase tracking-[0.12em]
  text-ktext-tertiary
  2px teal left border or teal underline accent

Pending request card:
  Same card style but with Accept (teal pill) + Decline (gray pill)
  "Wants to join your circle" subtitle
```

#### Dark Mode Connections (from screenshot)
```
HEADER: bg-bg-header (#0A1828) rounded-b-[24px]
  Has gradient fade below it into lighter section

SUB-HEADER AREA: bg slightly lighter (#0E2535 approx)
  "Connections": text-3xl text-accent-mint font-bold
  "Add Friend": bg-accent rounded-full h-11 px-5 text-on-accent

TABS: text-accent-mint (active) | text-ktext-secondary (inactive)
  Underline: h-[2px] bg-accent-mint

FRIEND ROWS: bg muted blue-gray (#5A7A8A approx — NOT the dark navy)
  This is unique: friends list uses a LIGHTER steel-blue tint
  rounded-full (fully rounded, pill-shaped rows, h=72px)
  Left: avatar w-12 h-12 + online dot (green or gray)
  Center: name text-ktext-primary (white) + tagline text-ktext-secondary smaller
  Right: nothing (no buttons visible in this view)
  Each row: rounded-full px-16px full width
  gap-8px between rows
```

---

### 16.6 WATCH HISTORY PAGE — Mobile Layout

#### Light Mode (from screenshots)
```
HEADER: standard

Watch History                              text-xl font-bold (or Display Small)
Your journey through the ethereal tide    text-sm text-ktext-secondary mt-4px
of sound and vision.

FILTER TABS (mt-16px)
[All] [Watched] [Listened]                pill tabs  gap-8px
Same pill style as OP/ED toggle

TODAY section divider (mt-24px)
────── TODAY ──────                        thin lines + text-[10px] uppercase tracking-wide
                                           text-ktext-tertiary, lines bg-border-subtle

HISTORY CARDS (space-y-12px)
┌─────────────────────────────────────────┐  bg-bg-surface rounded-[20px] p-16px
│ ┌─────────────┐  OPENING THEME         │  shadow-card border border-border-subtle
│ │             │  (text-[10px] text-accent uppercase)
│ │  image      │  Neon Genesis Rebirth   │  Image: w-20 h-20 rounded-[12px]
│ │  80px sq    │  Tokyo Sound Orchestra  │    (slightly larger than home list rows)
│ │             │                         │
│ │             │  🕐 2h ago  ▶ 04:32    │  Time: clock icon text-ktext-tertiary
│ └─────────────┘                         │  Duration: play icon + mm:ss text-ktext-tertiary
└─────────────────────────────────────────┘  No play button on right (full card is tappable)

YESTERDAY section divider — same style
```

#### Dark Mode History (from screenshot)
```
PAGE BG: bg-bg-base (#070F18)

"History"                                  text-4xl font-display font-extrabold #FFFFFF
"Relive your journey through the          text-sm text-ktext-secondary mt-4px
 bioluminescent currents."                (different copy in dark mode — flavor text)

TODAY / YESTERDAY dividers: same style
  text-[10px] uppercase tracking-wide
  text-ktext-tertiary (#4A6878)
  horizontal line bg-border-subtle

DARK HISTORY CARDS:
  bg: bg-bg-surface (#0C1C28) rounded-[20px] p-16px
  border border-border-subtle
  Image: rounded-[12px] w-20 h-20

  Type label: teal icon + "SOUNDSCAPE" / "VISUALIZER" / "OPENING THEME" uppercase
    text-[10px] text-accent-mint font-semibold tracking-wide
  Title: text-xl font-bold #FFFFFF (2 lines allowed)
  Description: text-sm text-ktext-tertiary truncated "..."
  Play circle btn: w-8 h-8 bg-bg-elevated rounded-full right side
    PlayCircle icon text-ktext-tertiary (subtle)
```

---

### 16.7 PROFILE PAGE — Mobile Layout

#### Light Mode (Own Profile)
```
HEADER: ← Profile    ⚙️ Settings            Back + page title + settings gear

AVATAR SECTION (centered, pt-24px)
     ┌───────────────────────┐
     │    [avatar 96px]      │  ring-2 ring-accent-mint ring-offset-2 ring-offset-bg-base
     │    rounded-full       │  w-24 h-24
     └───────────────────────┘
     Haru Yoshida                           text-2xl font-display font-bold text-ktext-primary text-center
     [bio text centered]                    text-sm text-ktext-secondary max-w-[260px] mx-auto

[Edit Profile]                             h-11 px-10 bg-transparent border-2 border-accent
                                           text-accent font-semibold rounded-full
                                           mt-16px

STATS ROW (mt-16px, 3 cards)
┌──────────┐ ┌──────────┐ ┌──────────┐    gap-12px
│   428    │ │  1.2k    │ │   856    │    bg-bg-elevated rounded-[16px] p-12px text-center
│ RATINGS  │ │ FRIENDS  │ │FOLLOWING │    Number: text-xl font-display font-bold text-accent (#0A8A96)
└──────────┘ └──────────┘ └──────────┘    Label: text-[9px] uppercase tracking-wide text-ktext-tertiary

Recent Activity (mt-24px)
"Recent Activity"     ← text-xl font-display font-bold text-ktext-primary
                         + "View All" text-sm text-accent right-aligned

ACTIVITY ROWS:
┌─────────────────────────────────────────┐  h=80px
│ ┌──────┐  Gurenge                 9.4  │  Image: w-14 h-14 rounded-full (circular!)
│ │ img  │  LiSA                        │  Score: w-10 h-10 rounded-full bg-accent-mint
│ │ 56px │  🎬 Demon Slayer             │    text-on-accent font-mono font-bold centered
│ │      │                              │  Anime with 🎬 icon: text-xs text-accent
└───────────────────────────────────────┘  Title: text-base font-semibold
                                           Artist: text-sm text-ktext-secondary
```

#### Dark Mode Profile (Own)
```
HEADER: bg-bg-header rounded-b-[24px]
  "Profile" centered in white text
  ← back arrow left, ⚙️ gear right (text-accent)

AVATAR: ring-2 ring-accent-mint, white glow effect (box-shadow: 0 0 20px rgba(78,205,196,0.4))
  Pencil edit badge: w-7 h-7 bg-accent-mint bottom-right, border-2 border-bg-base

Name: text-3xl font-display font-bold #FFFFFF
Bio: text-sm text-ktext-secondary centered

FOLLOW/MESSAGE buttons (other user dark profile):
  Follow: bg-accent-container border border-accent text-accent rounded-full h-11 px-6
  Message: bg-bg-elevated border border-border-default text-ktext-primary rounded-full h-11 px-6

STATS BOXES: bg-bg-elevated rounded-full (pill shape, wider)
  Number: text-2xl font-display font-bold text-accent-mint
  Label: text-[9px] uppercase text-ktext-tertiary

Recent Activity:
  Category label: text-accent-mint text-xs uppercase tracking-wide (above title)
  Title: text-lg font-bold #FFFFFF (2 lines)
  Description: text-sm text-ktext-secondary
  Chevron: > icon right side text-ktext-tertiary

BADGES/MILESTONES section (dark):
  2-column grid of badge cards
  bg-bg-elevated rounded-[20px] p-16px
  Icon: large teal symbol centered
  "Verified Curator": text-base font-bold #FFFFFF
  Subtitle: text-xs text-ktext-tertiary
```

---

### 16.8 SETTINGS PAGE — Mobile Layout

#### Light Mode
```
HEADER: ≋ Kaikansen     Settings             "Settings" text-base font-semibold text-ktext-primary

USER CARD (mt-16px)
┌─────────────────────────────────────────┐  bg-bg-surface rounded-[20px] p-16px shadow-card
│ ┌───────┐  Elena S.                     │  border border-border-subtle
│ │ img   │  Premium Member               │  Avatar: w-14 h-14 rounded-full ring-2 ring-accent-mint
│ │ 56px  │  ✓ VERIFIED  ← badge         │  Name: text-base font-semibold text-ktext-primary
│ └───────┘                               │  Role: text-xs text-ktext-secondary
└─────────────────────────────────────────┘  Verified badge: bg-accent-container text-accent
                                               text-[9px] font-bold uppercase flex items-center gap-1
                                               rounded-full px-2 py-0.5

SECTION LABEL: ACCOUNT
text-[11px] font-semibold tracking-[0.12em] uppercase text-accent mt-20px mb-8px px-2px

SECTION CARD
┌─────────────────────────────────────────┐  bg-bg-surface rounded-[20px] shadow-card
│ ┌──────┐  Email                    › │  border border-border-subtle overflow-hidden
│ │ icon │  elena.ocean@kaikansen.com   │
│ └──────┘                               │  Each row: h=60px flex items-center gap-12px px-16px
├─────────────────────────────────────────┤  Row divider: bg-border-subtle h-px
│ ┌──────┐  Password               › │
│ │ icon │  Changed 3 months ago       │  Icon container: w-9 h-9 bg-accent-container rounded-[10px]
│ └──────┘                               │  Icon: text-accent w-4 h-4
└─────────────────────────────────────────┘  Label: text-sm font-medium text-ktext-primary
                                              Subtitle: text-xs text-ktext-tertiary
                                              Chevron: text-ktext-tertiary

NOTIFICATIONS section (same card style):
  Toggle rows: Switch component right side
  ON toggle: bg-accent (teal filled)
  OFF toggle: bg-bg-elevated

PRIVACY section:
  2-column grid of action cards:
  ┌──────────────┐ ┌──────────────┐    bg-bg-elevated rounded-[16px] p-16px
  │ 🚫  Private  │ │ 🔄  Data     │    Icon: w-5 h-5 text-ktext-secondary
  │ Profile      │ │ Usage        │    Label: text-sm font-semibold text-ktext-primary
  │ Hide history │ │ Manage       │    Subtitle: text-xs text-ktext-tertiary
  └──────────────┘ └──────────────┘

LOGOUT BUTTON (mt-32px)
[→ Logout]                                full-width h-14 rounded-full
                                          bg: var(--logout-bg) = #0A8A96 in light (teal)
                                          text-white font-bold flex items-center justify-center gap-8px
                                          LogOut icon w-4 h-4

VERSION 2.4.0 (TIDE)                      text-center text-[10px] uppercase tracking-[0.2em]
                                          text-ktext-disabled mt-16px mb-safe
```

#### Dark Mode Settings
```
HEADER: bg-bg-header rounded-b-[24px]

USER CARD: bg-bg-surface
  Avatar: ring-2 ring-accent-mint + pencil badge bottom-right
  Name: text-xl font-bold #FFFFFF
  Role: "Premium Tidal Explorer" text-sm text-ktext-secondary

SECTION LABELS: text-accent-mint (#4ECDC4) uppercase tracking-[0.12em] text-[11px]
  NOT card-separated — labels appear above section cards as plain text

SECTION CARDS: bg-bg-surface rounded-[20px] border border-border-subtle
  Icon containers: bg-accent-container rounded-[10px]
  Icons: text-accent-mint
  Row dividers: bg-border-subtle
  Chevron: text-ktext-tertiary

Toggle ON: bg-accent-mint
Toggle OFF: bg-bg-overlay

APPEARANCE ROW: Appearance | [Dark Mode] badge
  "Dark Mode" badge: bg-bg-overlay border border-border-default
  text-ktext-secondary text-xs font-medium rounded-full px-2 py-0.5

LOGOUT BUTTON: bg: #8B1A1A (crimson-dark)
  "Logout from Kaikansen" text-white font-bold rounded-full h-14
  LogOut icon left side

VERSION: text-ktext-disabled tiny tracking-widest
```

---

### 16.9 LOGIN / AUTH PAGE — Mobile Layout

#### Light Mode (2 variants observed)

**Variant A — White background:**
```
FULL PAGE: bg-bg-base (#E8F4F7) centered content

LOGO (centered, pt-48px)
≋ logo   ← wave icon animated (SVG, teal)
Kaikansen ← text-4xl font-display font-extrabold text-ktext-primary

Welcome back                              text-2xl font-display font-bold mt-32px
Continue your journey through the tide.   text-sm text-ktext-secondary mt-4px

AUTH CARD (mt-24px, max-w-[340px] w-full)
bg-bg-surface rounded-[24px] p-24px shadow-modal border border-border-subtle

EMAIL ADDRESS ← text-[11px] uppercase tracking-wide text-ktext-tertiary mb-6px
┌─────────────────────────────────────────┐  h=48px
│ ✉  name@kaikansen.com                  │  bg-bg-elevated rounded-[12px]
└─────────────────────────────────────────┘  border border-border-default px-16px
                                             Icon: text-ktext-tertiary w-4 h-4

PASSWORD              Forgot? ← text-xs text-accent right
┌─────────────────────────────────────────┐  h=48px
│ 🔒  •••••••••   [👁 toggle]           │  Same input style + eye toggle right
└─────────────────────────────────────────┘

[Sign In]                                  full-width h-12 bg-accent text-white rounded-full
                                           font-semibold text-base mt-24px

Don't have an account? Create one          text-sm text-ktext-secondary + text-accent link mt-16px text-center

FOOTER (absolute bottom)
PRIVACY · TERMS · © 2024 Kaikansen        text-[10px] text-ktext-tertiary tracking-wide text-center
```

**Variant B — Teal background (alternate):**
```
FULL PAGE: bg-accent (#0A8A96) full screen (dark teal)

Wave icon in dark overlay container

Kaikansen ← text-5xl font-display font-extrabold text-white
THE ETHEREAL TIDE ← text-xs uppercase tracking-[0.25em] text-white/70

AUTH CARD: bg-accent-hover (slightly lighter teal) rounded-[28px] p-28px mx-16px
  Translucent card effect with border border-white/10

Welcome Back ← text-2xl font-bold text-white
Subtitle: text-sm text-white/70

Inputs: bg-white/10 border border-white/20 rounded-[14px] text-white placeholder-white/50

[Begin Journey →]                          bg-white text-accent font-bold rounded-full h-12
  Arrow icon right side

"New to the tide? Create account"          text-white/80 + text-white font-bold link

FOOTER: TERMS OF SERVICE · PRIVACY POLICY  bottom, text-white/50 text-[10px] uppercase

DECORATIVE: Mech/robot illustration partially visible at very bottom
```

#### Dark Mode Auth
```
FULL PAGE: bg-bg-base (#070F18) very dark navy

LOGO CONTAINER: w-16 h-16 bg-bg-surface rounded-[20px] flex items-center justify-center
  Wave ≋ icon: text-accent-mint text-2xl

Kaikansen ← text-4xl font-display font-extrabold text-white
THE ETHEREAL TIDE ← text-[11px] uppercase tracking-[0.25em] text-ktext-tertiary

AUTH CARD: bg-bg-surface (#0C1C28) rounded-[24px] p-24px border border-border-subtle
  Slightly translucent: bg-bg-surface/90 backdrop-blur

Welcome back ← text-2xl font-bold text-white
"Please enter your details to sign in." ← text-sm text-ktext-secondary

EMAIL/PASSWORD labels: text-[11px] uppercase tracking-[0.1em] text-ktext-tertiary

INPUTS: bg-bg-elevated (#112233) rounded-full h-12 px-16px
  border border-border-default
  Icon left: text-accent-mint w-4 h-4 (@, 🔒)
  Eye toggle right: text-ktext-tertiary
  Focus: border-accent-mint

[Sign In] btn: bg-accent-mint (#4ECDC4) text-on-accent (#063E3A) rounded-full h-12 full-width font-semibold

Don't have account? Create account        text-ktext-secondary + text-accent-mint link

FOOTER: Privacy Policy · Terms of Service · © 2024 KAIKANSEN LABS
  text-ktext-tertiary text-[10px]
```

---

### 16.10 ANIME PAGE — Mobile Layout

#### Light Mode
```
HERO BANNER (-mx-4, full bleed)
┌─────────────────────────────────────────┐  h=240px
│  [banner/grill image, object-cover]     │
│                                         │  Gradient: to-bottom transparent → bg-base
│  [ADVENTURE] [FANTASY]  ← genre tags  │  Genre tags: bottom-left overlay
│                                         │    bg-black/40 backdrop-blur text-white
│                                         │    rounded-full px-3 py-1 text-[10px] uppercase
│                                         │    border border-white/20 gap-8px
└─────────────────────────────────────────┘

TITLE SECTION (px-4, -mt-32px relative z-10)
Frieren: Beyond Journey's End             text-2xl font-display font-bold text-ktext-primary
★ 9.4 AniList   |  TV Series · 28 Ep     text-sm text-ktext-secondary flex gap-16px mt-4px
                                           Star: w-3.5 h-3.5 text-yellow-500 fill-yellow-500

THEMES CARD (mt-16px bg-bg-surface rounded-[20px] p-16px shadow-card)
  Header: Music icon + "Themes & Tracks" text-base font-semibold

  OPENINGS ← text-[10px] uppercase tracking-wide text-ktext-tertiary mb-8px
  ┌─────────────────────────────────────────┐  h=64px
  │ [● img 48px]  Yuusha           OP 1   │  Image: w-12 h-12 rounded-full (circular)
  │                YOASOBI                 │  Title: text-sm font-semibold
  │                ♥ 4.9/5.0               │  Artist: text-xs text-ktext-secondary
  └─────────────────────────────────────────┘  OP badge: right-aligned text-[10px]
                                               Rating: ♥ filled teal + score text-xs

  ENDINGS ← same label style, mt-16px
  Same row format

MEMORIES GALLERY (mt-16px bg-bg-surface rounded-[20px] p-16px)
  "MEMORIES GALLERY"    View All            text-xs uppercase label + text-accent link
  2×2 image grid + overflow "+12 MORE" card
  Each image: rounded-[12px] aspect-square
  "+12 MORE": bg-bg-elevated rounded-[12px] flex items-center justify-center
    text-sm font-semibold text-ktext-secondary

STUDIO/DIRECTOR (mt-16px)
  STUDIO label (text-[10px] uppercase text-ktext-tertiary)
  Studio name (text-sm text-ktext-primary)  mt-4px

[Add to Watchlist] ← full-width h-12 bg-accent-container text-accent rounded-full
  Bookmark icon + "Add to Watchlist" font-semibold

THE NARRATIVE (mt-16px)
  "The Narrative" text-xl font-bold text-ktext-primary
  Body text: text-sm text-ktext-secondary leading-relaxed (3-4 lines then Read More)
  [Read More ∨] text-accent text-sm font-semibold
```

#### Dark Mode Anime Page
```
HERO: same dimensions, darker gradient
Genre tags: bg-bg-surface/50 backdrop-blur border-border-subtle (uses theme colors)

THEMES CARD:
  Header icon: green/teal square icon (music note) + "Themes & Tracks"
  bg-bg-surface rounded-[20px] border border-border-subtle

  "OPENINGS" / "ENDINGS" dividers inside card:
    text-[10px] uppercase text-ktext-tertiary, no card separation just labels

  Theme rows: circular image, title text-white, artist text-ktext-secondary
  OP badge: right side text-xs bg-accent-container text-accent rounded

MEMORIES: 2×2 dark image grid, "+12" card bg-bg-elevated
  "MEMORY WOR 1 / SAFE WORK" small text overlay on some images (watermark style)

[Add to Watchlist]: bg-accent text-white rounded-full (filled in dark)

NARRATIVE CARD: bg-bg-surface rounded-[20px] p-16px border border-border-subtle
  Title text-xl font-bold #FFFFFF
  Body text-sm text-ktext-secondary
```

---

### 16.11 ARTIST PAGE — Mobile Layout

#### Light Mode
```
HEADER: standard

ARTIST HERO (centered, pt-24px)
[concert/artist image in circle]           w-28 h-28 rounded-full overflow-hidden
                                           ring-2 ring-accent-mint ring-offset-2
✓ verified badge (bottom-right of avatar) w-7 h-7 bg-accent rounded-full
                                           border-2 border-bg-base Check icon white

YOASOBI                                    text-3xl font-display font-extrabold
                                           text-ktext-primary uppercase tracking-tight text-center
"Novel into music"                         text-sm text-ktext-secondary text-center mt-4px

STATS (2 cards, mt-16px)
┌──────────────────────┐ ┌──────────────────────┐
│  3.2B                │ │  #1                  │  bg-bg-elevated rounded-[16px] p-16px
│  TOTAL STREAMS       │ │  GLOBAL RANK         │  Number: text-2xl font-bold text-accent
└──────────────────────┘ └──────────────────────┘  Label: text-[9px] uppercase text-ktext-tertiary

ACTION BUTTONS (mt-16px gap-12px)
[+ Follow Artist]  [Play Latest]            Follow: bg-accent text-white rounded-full h-11 px-8
                                            Play: bg-transparent border border-border-default
                                              text-ktext-primary rounded-full h-11 px-6

Discography (mt-24px)
"Discography"     View All →               text-xl font-bold + text-accent link

DISCOGRAPHY ROWS:
┌─────────────────────────────────────────┐  h=64px
│ [● img 48px]  Idol                  ⋮  │  Circular image w-12 h-12
│                Oshi no Ko Theme         │  Title: text-sm font-semibold
│                OP  •  2023  •  4:32     │  Meta: OP badge + year + duration
└─────────────────────────────────────────┘    text-xs text-ktext-tertiary gap-4px

"The Story" / Artist Biography card (mt-24px)
bg-bg-surface rounded-[20px] p-16px shadow-card
"Artist Biography" text-lg font-bold text-ktext-primary
Body: text-sm text-ktext-secondary leading-relaxed
[Read More ∨] text-accent
```

#### Dark Mode Artist
```
HERO BG: Page bg-bg-base (#070F18)
Concert image circular: ring-2 ring-accent-mint
                         white ambient glow (box-shadow 0 0 40px rgba(78,205,196,0.3))

Name: text-4xl font-extrabold #FFFFFF uppercase
Bio: text-sm text-ktext-secondary

Stats: bg-bg-elevated (#112233) rounded-[16px]
  Number: text-2xl font-bold text-accent-mint

Follow btn: bg-transparent border-2 border-accent-mint text-accent-mint rounded-full h-11
  "+" prefix
Play Latest: plain text, no bg, no border, text-white rounded-full

Discography rows: NO card bg — just image + text + ⋮ menu icon
  ⋮ icon: text-ktext-tertiary
  Circular images: rounded-full w-12 h-12

"The Story" card: bg-bg-surface rounded-[20px] border border-border-subtle p-16px
  "The Story" text-lg font-bold text-white
  Body text: text-sm text-ktext-secondary
  Genre tags below: [J-POP] [ELECTRONIC] [STORYTELLING]
    bg-bg-elevated rounded-full px-3 py-1 text-[10px] text-ktext-secondary
    border border-border-subtle gap-8px flex-wrap

TOUR CARD (at bottom, if present):
  Full-width card with image bg
  "Upcoming World Tour" text-xs uppercase text-accent-mint overlay
  "Midnight Sun 2024" text-xl font-bold text-white
  "12 Countries · 24 Cities · Starting January" text-sm text-white/70
  rounded-[20px] overflow-hidden h-40
```

---

### 16.12 BOTTOM NAVIGATION — Exact Specs

```
Container:
  h: 64px + safe-area-inset-bottom
  position: fixed bottom-0 left-0 right-0 z-50
  Light: bg-bg-surface border-t border-border-subtle
  Dark: bg-bg-surface (no border)

4 Items — equal width (25% each):

LIGHT MODE active item:
  Large pill behind icon+label: w-20 h-10 rounded-full bg-accent-mint (#4ECDC4)
  Icon: text-accent (#0A8A96) w-6 h-6
  Label: text-[10px] font-body text-accent visible on active only
  Inactive: icon only, text-ktext-tertiary, no bg

DARK MODE active item:
  Larger oval behind icon: w-20 h-10 rounded-full bg-accent-container
  Icon: text-accent-mint (#4ECDC4)
  Label: text-[10px] text-accent-mint visible on active
  Inactive: icon text-ktext-tertiary (#4A6878) no label

Nav icons:
  Home: drop/wave icon (💧 or custom wave SVG)
  Search: magnifying glass
  Alerts/Notifications: bell (red dot badge if unread)
  Profile: person silhouette

Bell badge (notifications):
  w-4 h-4 rounded-full bg-error (#DC2626) text-white
  text-[8px] font-mono
  position: absolute top-2 right-[calc(50%-14px)]
  Content: count if ≤9, "9+" if more
```

---

### 16.13 SPACING & VISUAL RHYTHM

All screens follow this consistent vertical rhythm:

```
Header:              h=56px   fixed top
Page content start:  pt=16px  below header (pt=20px dark due to rounded corners)
Section gap:         mt=24px  between major sections
Card gap:            gap-12px between list rows
Card padding:        p=16px   inside all cards
Inner element gap:   gap=8px  between small elements (badges, icons, text)
Section label → card: mb=8px
Bottom nav buffer:   pb=80px  last item clears nav

Horizontal padding:
  Mobile: px=16px (4 on each side from Tailwind px-4)
  Bleed items (hero, video, featured strip): -mx-4 to remove padding
```

---

### 16.14 TYPOGRAPHY SIZES — Mobile Exact

| Element | Size | Weight | Color token |
|---|---|---|---|
| App name header | 18px | 700 | ktext-primary |
| Page title (Display) | 24-30px | 700-800 | ktext-primary |
| Artist name (hero) | 28-36px | 800 | ktext-primary |
| Song title | 20-24px | 700 | ktext-primary |
| Section heading | 18-20px | 700 | ktext-primary |
| List row title | 14px | 600 | ktext-primary |
| List row subtitle | 12px | 400 | ktext-secondary |
| List row meta | 12px | 400 | ktext-tertiary |
| Section label | 10-11px | 600 | ktext-tertiary / accent |
| Badge/chip | 10px | 700 | varies |
| Timestamp | 11-12px | 400 | ktext-tertiary |
| Score (large) | 32-40px | 700 | getScoreColor() |
| Score (inline) | 13-14px | 700 | ktext-secondary |
| Button label | 14px | 600 | varies |
| Input text | 14px | 400 | ktext-primary |
| Version string | 10px | 400 | ktext-disabled |

---

## 17. NEXT.JS DARK MODE INTEGRATION

### next-themes Setup
```tsx
// /app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### ThemeToggle Component (Settings Page)
```tsx
// /app/components/shared/ThemeToggle.tsx
"use client"
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const options = [
    { value: 'light', icon: Sun,     label: 'Light'  },
    { value: 'dark',  icon: Moon,    label: 'Dark'   },
    { value: 'system',icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex gap-1 p-1 bg-bg-elevated rounded-full">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-body font-medium
            transition-colors duration-150 interactive
            ${theme === opt.value
              ? 'bg-accent text-white'
              : 'text-ktext-secondary hover:text-ktext-primary'
            }`}
        >
          <opt.icon className="w-3.5 h-3.5" />
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

### useTheme Hook (App-level)
```tsx
// /app/hooks/useTheme.ts
"use client"
import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return {
    theme:   mounted ? resolvedTheme : undefined,
    rawTheme: mounted ? theme : undefined,
    setTheme,
    isDark:  mounted ? resolvedTheme === 'dark' : false,
    isLight: mounted ? resolvedTheme === 'light' : true,
    mounted,
    toggle:  () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }
}
```

### Dark Mode Header Detection
```tsx
// AppHeader uses useTheme to conditionally apply rounded bottom
"use client"
export function AppHeader() {
  const { isDark } = useTheme()
  return (
    <header className={`
      sticky top-0 z-40 h-14 px-4 flex items-center justify-between
      bg-bg-header
      ${isDark ? 'rounded-b-[24px] shadow-md' : 'border-b border-border-subtle'}
    `}>
      {/* content */}
    </header>
  )
}
```

### CSS Variable Switching (globals.css)
The CSS variables defined in §2 automatically switch when `[data-theme="dark"]` is applied to `<html>` by next-themes. No JavaScript needed for color switching — it is entirely CSS-driven.

```css
/* Light mode: :root */
/* Dark mode: [data-theme="dark"] */
/* Both defined in globals.css §2 */
/* next-themes toggles the attribute — CSS does the rest */
```

---

## 18. ARTIST PAGE DESIGN

### Artist Page Color Notes
- Light mode: same teal/white system as rest of app
- Dark mode: deep navy bg with mint teal accents, concert/artwork image in circular avatar
- Avatar glow (dark only): `box-shadow: 0 0 40px rgba(78, 205, 196, 0.35)`

### Discography Row
```tsx
<div className="flex items-center gap-3 py-3 border-b border-border-subtle interactive cursor-pointer">
  {/* Circular image */}
  <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
    <Image src={animeCoverImage} alt={songTitle} fill className="object-cover rounded-full" />
  </div>

  {/* Info */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-body font-semibold text-ktext-primary truncate">{songTitle}</p>
    <div className="flex items-center gap-2 mt-0.5">
      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full
        ${type === 'OP' ? 'bg-accent-container text-accent' : 'bg-accent-ed-container text-accent-ed'}`}>
        {type}
      </span>
      <p className="text-xs text-ktext-tertiary truncate">{animeTitle} · {year}</p>
    </div>
  </div>

  {/* More menu */}
  <button className="w-8 h-8 rounded-full flex items-center justify-center interactive">
    <MoreVertical className="w-4 h-4 text-ktext-tertiary" />
  </button>
</div>
```

### Artist Bio Card
```tsx
<div className="bg-bg-surface rounded-[20px] border border-border-subtle p-4 shadow-card mt-4">
  <h3 className="text-lg font-display font-bold text-ktext-primary mb-2">
    {isDark ? 'The Story' : 'Artist Biography'}
  </h3>
  <p className="text-sm font-body text-ktext-secondary leading-relaxed line-clamp-4">
    {bio}
  </p>
  <button className="text-xs text-accent font-semibold mt-2 interactive flex items-center gap-1">
    Read More <ChevronDown className="w-3 h-3" />
  </button>

  {/* Genre tags */}
  <div className="flex flex-wrap gap-2 mt-3">
    {genres.map(g => (
      <span key={g} className="text-[10px] font-body font-medium px-2.5 py-1 rounded-full
                               bg-bg-elevated text-ktext-secondary border border-border-subtle">
        {g}
      </span>
    ))}
  </div>
</div>
```

---

## 19. FOLLOW BUTTON DESIGN

### FollowButton Component States

```tsx
// /app/components/shared/FollowButton.tsx ("use client")
export function FollowButton({ username }: { username: string }) {
  const { isFollowing, follow, unfollow, isPending } = useFollow(username)

  // Light mode: filled when not following, outlined/muted when following
  // Dark mode: outlined accent-mint when not following, filled container when following
  return (
    <button
      onClick={() => isFollowing ? unfollow() : follow()}
      disabled={isPending}
      className={`
        flex items-center gap-2 h-11 px-6 rounded-full font-body font-semibold text-sm
        transition-all duration-150 interactive
        ${isFollowing
          ? 'bg-accent-container text-accent border border-border-accent'
          : 'bg-accent text-white hover:bg-accent-hover'
        }
        ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          Follow Artist
        </>
      )}
    </button>
  )
}
```

---

## 20. LIVE STATS CARDS DESIGN

```tsx
// Home page bottom section — 2 stat cards side by side
<div className="flex gap-3 mt-6">
  {/* Active Users card */}
  <div className="flex-1 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card">
    <TrendingUp className="w-5 h-5 text-accent mb-2" />
    <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-ktext-tertiary">
      Active Users
    </p>
    <p className="text-2xl font-display font-bold text-ktext-primary mt-0.5">
      {formatCount(activeUsers)}
    </p>
  </div>

  {/* Listening Now card */}
  <div className="flex-1 bg-bg-surface rounded-[16px] border border-border-subtle p-4 shadow-card">
    {/* Avatar stack */}
    <div className="flex items-center mb-2">
      {avatars.slice(0, 3).map((src, i) => (
        <Image key={i} src={src} alt="" width={20} height={20}
               className={`w-5 h-5 rounded-full border border-bg-surface ${i > 0 ? '-ml-1' : ''}`} />
      ))}
      {listeningCount > 3 && (
        <span className="text-[10px] text-ktext-tertiary ml-1.5">+{listeningCount - 3}</span>
      )}
    </div>
    <p className="text-[10px] font-body font-semibold uppercase tracking-wide text-ktext-tertiary">
      Listening Now
    </p>
    <p className="text-2xl font-display font-bold text-ktext-primary mt-0.5">
      {listeningNow}
    </p>
  </div>
</div>
```

Dark mode stats:
- `ACTIVE USERS` and `LISTENING NOW` labels: `text-accent-mint` (mint teal) NOT `text-ktext-tertiary`
- Numbers: white `#FFFFFF`
- Card bg: `bg-bg-surface` with darker elevation
