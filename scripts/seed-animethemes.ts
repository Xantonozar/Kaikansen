import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import path from 'path'
import fs from 'fs'
import { connectDB } from '../lib/db'
import { ThemeCache, ArtistCache } from '../lib/models'

const BASE_URL = 'https://api.animethemes.moe'
const DELAY_AT = 800
const MAX_RETRIES = 2

const THEMES = [
  { anime: "Neon Genesis Evangelion", title: "A Cruel Angel's Thesis", type: "OP" },
  { anime: "Fullmetal Alchemist: Brotherhood", title: "Again", type: "OP" },
  { anime: "Tokyo Ghoul", title: "Unravel", type: "OP" },
  { anime: "Jujutsu Kaisen", title: "Kaikai Kitan", type: "OP" },
  { anime: "Attack on Titan", title: "Guren no Yumiya", type: "OP" },
  { anime: "Oshi no Ko", title: "Idol", type: "OP" },
  { anime: "Cowboy Bebop", title: "Tank!", type: "OP" },
  { anime: "Naruto Shippuden", title: "Silhouette", type: "OP" },
  { anime: "Bakemonogatari", title: "Kimi no Shiranai Monogatari", type: "ED" },
  { anime: "Kekkai Sensen", title: "Sugar Song to Bitter Step", type: "ED" },
  { anime: "Demon Slayer", title: "Gurenge", type: "OP" },
  { anime: "Steins;Gate", title: "Hacking to the Gate", type: "OP" },
  { anime: "Code Geass", title: "Colors", type: "OP" },
  { anime: "Your Lie in April", title: "Hikaru Nara", type: "OP" },
  { anime: "One Piece", title: "We Are!", type: "OP" },
  { anime: "Hunter x Hunter (2011)", title: "Departure!", type: "OP" },
  { anime: "Blue微", title: "Ao no Sumika", type: "OP" },
  { anime: "Chainsaw Man", title: "Kick Back", type: "OP" },
  { anime: "Vinland Saga", title: "MUKANJYO", type: "OP" },
  { anime: "Cyberpunk: Edgerunners", title: "This Fffire", type: "OP" },
  { anime: "Death Note", title: "The World", type: "OP" },
  { anime: "Mob Psycho 100", title: "99", type: "OP" },
  { anime: "Parasyte -the maxim-", title: "Let Me Hear", type: "OP" },
  { anime: "Sword Art Online", title: "Crossing Field", type: "OP" },
  { anime: "No Game No Life", title: "This Game", type: "OP" },
  { anime: "Noragami", title: "Goya no Machiawase", type: "OP" },
  { anime: "My Hero Academia", title: "The Day", type: "OP" },
  { anime: "Bleach", title: "Asterisk", type: "OP" },
  { anime: "Black Clover", title: "Black Rover", type: "OP" },
  { anime: "Frieren: Beyond Journey's End", title: "Yuusha", type: "OP" },
  { anime: "Violet Evergarden", title: "Sincerely", type: "OP" },
  { anime: "Erased", title: "Re:Re:", type: "OP" },
  { anime: "Fate/Zero", title: "Oath Sign", type: "OP" },
  { anime: "Psycho-Pass", title: "Abnormalize", type: "OP" },
  { anime: "Dr. Stone", title: "Good Morning World!", type: "OP" },
  { anime: "Fire Force", title: "Inferno", type: "OP" },
  { anime: "Kill la Kill", title: "Sirius", type: "OP" },
  { anime: "Samurai Champloo", title: "Battlecry", type: "OP" },
  { anime: "Haikyu!!", title: "Imagination", type: "OP" },
  { anime: "Dororo", title: "Kaen", type: "OP" },
  { anime: "Soul Eater", title: "Resonance", type: "OP" },
  { anime: "Gurren Lagann", title: "Sorairo Days", type: "OP" },
  { anime: "Re:Zero", title: "Redo", type: "OP" },
  { anime: "One Punch Man", title: "The Hero!", type: "OP" },
  { anime: "Mushoku Tensei", title: "Tabibito no Uta", type: "OP" },
  { anime: "Great Teacher Onizuka", title: "Driver's High", type: "OP" },
  { anime: "Trigun", title: "H.T.", type: "OP" },
  { anime: "Serial Experiments Lain", title: "Duvet", type: "OP" },
  { anime: "Eighty-Six", title: "Kyokaisen", type: "OP" },
  { anime: "Spy x Family", title: "Mixed Nuts", type: "OP" },
  { anime: "Akaame ga Kill!", title: "Skyreach", type: "OP" },
  { anime: "Deadman Wonderland", title: "One Reason", type: "OP" },
  { anime: "Mirai Nikki", title: "Kuusou Mesorogiwi", type: "OP" },
  { anime: "Darker than Black", title: "Howling", type: "OP" },
  { anime: "Hellsing Ultimate", title: "Gradus Vita", type: "OP" },
  { anime: "JoJo's Bizarre Adventure", title: "Bloody Stream", type: "OP" },
  { anime: "Durarara!!", title: "Uraomote Fortune", type: "OP" },
  { anime: "Gintama", title: "Pray", type: "OP" },
  { anime: "D.Gray-man", title: "Innocent Sorrow", type: "OP" },
  { anime: "Blue Exorcist", title: "Core Pride", type: "OP" },
  { anime: "Tokyo Revengers", title: "Cry Baby", type: "OP" },
  { anime: "Bleach", title: "Ranbu no Melody", type: "OP" },
  { anime: "Naruto Shippuden", title: "Sign", type: "OP" },
  { anime: "Attack on Titan", title: "Shinzou wo Sasageyo!", type: "OP" },
  { anime: "Fairy Tail", title: "Snow Fairy", type: "OP" },
  { anime: "Domestic Girlfriend", title: "Kawaki wo Ameku", type: "OP" },
  { anime: "Elfen Lied", title: "Lilium", type: "OP" },
  { anime: "Guilty Crown", title: "My Dearest", type: "OP" },
  { anime: "Angel Beats!", title: "My Soul, Your Beats!", type: "OP" },
  { anime: "Charlotte", title: "Bravely You", type: "OP" },
  { anime: "Bunny Girl Senpai", title: "Kimi no Sei", type: "OP" },
  { anime: "Kaguya-sama: Love is War", title: "Love Dramatic", type: "OP" },
  { anime: "Black Butler", title: "Monochrome no Kiss", type: "OP" },
  { anime: "Yuri!!! on Ice", title: "History Maker", type: "OP" },
  { anime: "Bungo Stray Dogs", title: "Trash Candy", type: "OP" },
  { anime: "Highschool of the Dead", title: "HIGHSCHOOL OF THE DEAD", type: "OP" },
  { anime: "Hellsing", title: "Logos Naki World", type: "OP" },
  { anime: "Claymore", title: "Raison d'être", type: "OP" },
  { anime: "Devilman Crybaby", title: "MAN HUMAN", type: "OP" },
  { anime: "The Promised Neverland", title: "Touch Off", type: "OP" },
  { anime: "Hell's Paradise", title: "WORK", type: "OP" },
  { anime: "Solo Leveling", title: "LEveL", type: "OP" },
  { anime: "Kaiju No. 8", title: "Abyss", type: "OP" },
  { anime: "Beastars", title: "Kaibutsu", type: "OP" },
  { anime: "Dorohedoro", title: "Welcome to Chaos", type: "OP" },
  { anime: "Baccano!", title: "Gun's & Roses", type: "OP" },
  { anime: "Nichijou", title: "Hyadain no Kakakata Kataomoi", type: "OP" },
  { anime: "K-On!", title: "Cagayake! GIRLS", type: "OP" },
  { anime: "Clannad", title: "Mag Mell", type: "OP" },
  { anime: "Toradora!", title: "Pre-Parade", type: "OP" },
  { anime: "Monthly Girls' Nozaki-kun", title: "Kimi Janakya Dame Mitai", type: "OP" },
  { anime: "Horimiya", title: "Iro Kousui", type: "OP" },
  { anime: "Wotakoi", title: "Fiction", type: "OP" },
  { anime: "Nana", title: "Rose", type: "OP" },
  { anime: "Paradise Kiss", title: "Lonely in Gorgeous", type: "OP" },
  { anime: "Beck: Mongolian Chop Squad", title: "Hit in the USA", type: "OP" },
  { anime: "Initial D", title: "Around the World", type: "OP" },
  { anime: "Dragon Ball Z", title: "Cha-La Head-Cha-La", type: "OP" },
  { anime: "YuYu Hakusho", title: "Hohoemi no Bakudan", type: "OP" },
  { anime: "Slam Dunk", title: "Kimi ga Suki da to Sakebitai", type: "OP" },
  { anime: "Rurouni Kenshin", title: "Sobakasu", type: "OP" },
  { anime: "InuYasha", title: "Change the World", type: "OP" },
  { anime: "Sailor Moon", title: "Moonlight Densetsu", type: "OP" },
  { anime: "Cardcaptor Sakura", title: "Catch You Catch Me", type: "OP" },
  { anime: "Pokémon", title: "Gotta Catch 'Em All", type: "OP" },
  { anime: "Digimon Adventure", title: "Butter-Fly", type: "OP" },
  { anime: "Yu-Gi-Oh!", title: "Voice", type: "OP" },
  { anime: "Gundam Wing", title: "Just Communication", type: "OP" },
  { anime: "Ouran High School Host Club", title: "Sakura Kiss", type: "OP" },
  { anime: "Fruits Basket (2019)", title: "Again", type: "OP" },
  { anime: "Maid Sama!", title: "My Secret", type: "OP" },
  { anime: "Say 'I Love You'", title: "Friendship", type: "OP" },
  { anime: "Kamisama Kiss", title: "Kamisama Hajimemashita", type: "OP" },
  { anime: "Blue Spring Ride", title: "Sekai wa Koi ni Ochiteiru", type: "OP" },
  { anime: "The Ancient Magus' Bride", title: "Here", type: "OP" },
  { anime: "To Your Eternity", title: "Pink Blood", type: "OP" },
  { anime: "Land of the Lustrous", title: "Kyoumen no Nami", type: "OP" },
  { anime: "Made in Abyss", title: "Deep in Abyss", type: "OP" },
  { anime: "Girls' Last Tour", title: "Ugoku, Ugoku", type: "OP" },
  { anime: "Keep Your Hands Off Eizouken!", title: "Easy Breezy", type: "OP" },
  { anime: "Odd Taxi", title: "ODDTAXI", type: "OP" },
  { anime: "Ranking of Kings", title: "BOY", type: "OP" },
  { anime: "Heavenly Delusion", title: "Innocent Arrogance", type: "OP" },
  { anime: "Summertime Rendering", title: "Hoshi ga Oyogu", type: "OP" },
  { anime: "Re:Zero S2", title: "Realize", type: "OP" },
  { anime: "Fate/stay night: UBW", title: "Brave Shine", type: "OP" },
  { anime: "Monogatari Series: Second Season", title: "Mousou Express", type: "OP" },
  { anime: "Assassination Classroom", title: "Seishun Satsubatsuron", type: "OP" },
  { anime: "Food Wars!", title: "Kibou no Uta", type: "OP" },
  { anime: "Haikyu!! S2", title: "Fly High!!", type: "OP" },
  { anime: "Kuroko's Basketball", title: "Can Do", type: "OP" },
  { anime: "Free!", title: "Rage on", type: "OP" },
  { anime: "Sk8 the Infinity", title: "Paradise", type: "OP" },
  { anime: "Blue Lock", title: "Chaos ga Kiwamaru", type: "OP" },
  { anime: "Lycoris Recoil", title: "ALIVE", type: "OP" },
  { anime: "Bocchi the Rock!", title: "Seishun Complex", type: "OP" },
  { anime: "Call of the Night", title: "Datenshi", type: "OP" },
  { anime: "Dandadan", title: "Otonoke", type: "OP" },
  { anime: "Undead Unluck", title: "01", type: "OP" },
  { anime: "Shangri-La Frontier", title: "Broken Games", type: "OP" },
  { anime: "Mashle", title: "Bling-Bang-Bang-Born", type: "OP" },
  { anime: "Fullmetal Alchemist", title: "Melissa", type: "OP" },
  { anime: "Soul Eater", title: "Papermoon", type: "OP" },
  { anime: "Bleach", title: "Velonica", type: "OP" },
  { anime: "Gintama", title: "Tougenkyou Alien", type: "OP" },
  { anime: "Naruto", title: "Haruka Kanata", type: "OP" },
  { anime: "Naruto Shippuden", title: "Blue Bird", type: "OP" },
  { anime: "One Piece", title: "Hope", type: "OP" },
  { anime: "Black Clover", title: "Black Catcher", type: "OP" },
  { anime: "My Hero Academia", title: "Peace Sign", type: "OP" },
  { anime: "Hunter x Hunter", title: "Hunting for your Dream", type: "ED" },
  { anime: "Fullmetal Alchemist: Brotherhood", title: "Rain", type: "OP" },
  { anime: "Death Note", title: "What's Up People?!", type: "OP" },
  { anime: "Attack on Titan", title: "The Rumbling", type: "OP" },
  { anime: "Jujutsu Kaisen", title: "LOST IN PARADISE", type: "ED" },
  { anime: "Chainsaw Man", title: "Chainsaw Blood", type: "ED" },
  { anime: "Cyberpunk: Edgerunners", title: "I Really Want to Stay at Your House", type: "ED" },
  { anime: "Frieren", title: "Anytime Anywhere", type: "ED" },
  { anime: "Dungeon Meshi", title: "Sleep Walking Orchestra", type: "OP" },
  { anime: "The Apothecary Diaries", title: "Hana ni Natte", type: "OP" },
  { anime: "Vinland Saga S2", title: "River", type: "OP" },
  { anime: "Mushoku Tensei S2", title: "spiral", type: "OP" },
  { anime: "Re:Zero", title: "STYX HELIX", type: "ED" },
  { anime: "Steins;Gate 0", title: "Fatima", type: "OP" },
  { anime: "86", title: "Avid", type: "ED" },
  { anime: "Violet Evergarden", title: "Michishirube", type: "ED" },
  { anime: "Anohana", title: "Secret Base", type: "ED" },
  { anime: "Angel Beats!", title: "Brave Song", type: "ED" },
  { anime: "Clannad: After Story", title: "Toki wo Kizamu Uta", type: "OP" },
  { anime: "Toradora!", title: "Orange", type: "ED" },
  { anime: "Your Lie in April", title: "Kirameki", type: "ED" },
  { anime: "Bunny Girl Senpai", title: "Fukashigi no Karte", type: "ED" },
  { anime: "Monogatari Series", title: "Renai Circulation", type: "OP" },
  { anime: "Nisemonogatari", title: "Platinum Disco", type: "OP" },
  { anime: "Lucky Star", title: "Motteke! Sailor Fuku", type: "OP" },
  { anime: "Haruhi Suzumiya", title: "Hare Hare Yukai", type: "ED" },
  { anime: "K-On!!", title: "No, Thank You!", type: "ED" },
  { anime: "Love, Chunibyo & Other Delusions", title: "Sparkling Daydream", type: "OP" },
  { anime: "Hyouka", title: "Yasashisa no Riyuu", type: "OP" },
  { anime: "Beyond the Boundary", title: "Kyokai no Kanata", type: "OP" },
  { anime: "Sound! Euphonium", title: "Dream Solister", type: "OP" },
  { anime: "Miss Kobayashi's Dragon Maid", title: "Aozora no Rhapsody", type: "OP" },
  { anime: "A Place Further than the Universe", title: "The Girls Are Alright!", type: "OP" },
  { anime: "Yuru Camp", title: "Shiny Days", type: "OP" },
  { anime: "Non Non Biyori", title: "Nanairo Biyori", type: "OP" },
  { anime: "Flying Witch", title: "Shanranran", type: "OP" },
  { anime: "Barakamon", title: "Rashisa", type: "OP" },
  { anime: "Silver Spoon", title: "Kiss you", type: "OP" },
  { anime: "March Comes in Like a Lion", title: "Answer", type: "OP" },
  { anime: "Ping Pong the Animation", title: "Tada Hitori", type: "OP" },
  { anime: "The Tatami Galaxy", title: "Maigoinu to Ame no Beat", type: "OP" },
  { anime: "Devilman Crybaby", title: "Devilman no Uta", type: "OP" },
  { anime: "Paranoia Agent", title: "Dream Island思念", type: "OP" },
  { anime: "Texhnolyze", title: "Guardian Angel", type: "OP" },
  { anime: "Ergo Proxy", title: "Kiri", type: "OP" },
  { anime: "Wolf's Rain", title: "Stray", type: "OP" },
  { anime: "Hellsing", title: "The World Without Logos", type: "OP" },
  { anime: "Baccano!", title: "Gun's & Roses", type: "OP" }
]

interface VideoSource {
  resolution  : number | null
  url         : string | null
  audioUrl    : string | null
  audioSize   : number | null
  source      : string | null
  nc          : boolean
  lyrics      : boolean
  subbed      : boolean
  uncen       : boolean
  overlap    : string | null
  size        : number | null
  tags        : string | null
  basename   : string | null
}

interface Entry {
  version   : number
  episodes  : string | null
  isNsfw    : boolean
  isSpoiler : boolean
  notes     : string | null
  videos    : VideoSource[]
}

interface ParsedTheme {
  animethemesThemeId : number
  slug              : string
  type              : 'OP' | 'ED' | 'IN'
  sequence          : number
  songTitle         : string
  allArtists       : string[]
  artistSlugs      : string[]
  artistRoles     : string[]
  entries         : Entry[]
  overlapNote     : string | null
}

interface ParsedAnime {
  animeSlug           : string
  animethemesId      : number
  animeTitle        : string
  animeTitleEnglish : string | null
  animeTitleRomaji  : string | null
  animeTitleNative  : string | null
  animeTitleAlternative: string[]
  animeSeason      : string | null
  animeSeasonYear  : number | null
  animeCoverImage  : string | null
  animeSmallCoverImage: string | null
  animeBannerImage : string | null
  animeGrillImage : string | null
  animeSynopsis   : string | null
  animeMediaFormat: string | null
  animeSeries     : string[]
  animeStudios    : string[]
  animeSynonyms   : string[]
  malId           : number | null
  anilistId       : number | null
  kitsuId         : string | null
  themes          : ParsedTheme[]
  syncedAt        : Date
}

const SCRIPTS_DIR = path.join(process.cwd(), 'scripts')
const PROGRESS_FILE = path.join(SCRIPTS_DIR, 'seed-animethemes-progress.json')

interface Progress {
  total: number
  processed: number
  skipped: number
  failed: number
  lastAnime: string
  lastUpdated: string
}

let logStream: fs.WriteStream
let progress: Progress

function initLog() {
  logStream = fs.createWriteStream(path.join(SCRIPTS_DIR, 'seed-animethemes.log'), { flags: 'a' })
}

function log(msg: string) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19)
  const line = `[${ts}] ${msg}`
  console.log(line)
  logStream?.write(line + '\n')
}

function div(char = '─', len = 60) {
  const line = char.repeat(len)
  console.log(line)
  logStream?.write(line + '\n')
}

function loadProgress(): Progress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    }
  } catch {}
  return {
    total: THEMES.length,
    processed: 0,
    skipped: 0,
    failed: 0,
    lastAnime: '',
    lastUpdated: new Date().toISOString()
  }
}

function saveProgress() {
  progress.lastUpdated = new Date().toISOString()
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

const animeCache = new Map<string, { slug: string; id: number; name: string }>()

async function fetchAnimeListPage(page: number): Promise<{ slug: string; id: number; name: string }[]> {
  try {
    await sleep(DELAY_AT)
    const url = `${BASE_URL}/anime?page[number]=${page}&page[size]=100&fields[anime]=slug,id,name`
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'AnimeSeeder/1.0',
        'Accept': 'application/json'
      } 
    })
    
    if (!res.ok) {
      log(`   ⚠️  HTTP ${res.status} on page ${page}`)
      return []
    }
    
    const data = await res.json()
    const animeList = (data.anime ?? []).map((a: any) => ({
      slug: a.slug,
      id: a.id,
      name: a.name
    }))
    
    return animeList
  } catch (err) {
    log(`   ⚠️  Error on page ${page}: ${err instanceof Error ? err.message : 'unknown'}`)
    return []
  }
}

async function buildAnimeCache(): Promise<void> {
  log(`📥 Building anime cache...`)
  
  const pageSize = 100
  const maxPages = 15
  
  for (let page = 1; page <= maxPages; page++) {
    const animeList = await fetchAnimeListPage(page)
    
    if (animeList.length === 0) {
      log(`   Reached end at page ${page - 1}`)
      break
    }
    
    for (const a of animeList) {
      const searchKey = a.name.toLowerCase()
      animeCache.set(searchKey, a)
    }
    
    log(`   Page ${page}: added ${animeList.length} (total: ${animeCache.size})`)
    
    if (page >= maxPages) break
  }
  
  log(`   ✅ Cache built: ${animeCache.size} anime`)
}

function searchAnime(query: string): { slug: string; id: number } | null {
  const q = query.toLowerCase()
  
  for (const [name, data] of animeCache) {
    if (name.includes(q) || q.includes(name)) {
      log(`   📍 Found: ${data.name} (${data.slug})`)
      return { slug: data.slug, id: data.id }
    }
  }
  
  log(`   ⚠️  Not found: ${query}`)
  return null
}

async function fetchThemeDetails(slug: string): Promise<ParsedAnime | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sleep(DELAY_AT * attempt)
      const url = `${BASE_URL}/anime/${slug}?include=animethemes.animethemeentries.videos.audio,animethemes.song.artists,animethemes.group,animesynonyms,images,resources,series,studios`
      const res = await fetch(url, { 
        headers: { 
          'User-Agent': 'AnimeSeeder/1.0',
          'Accept': 'application/json'
        } 
      })
      
      if (!res.ok) continue
      
      const data = await res.json()
      return parseATResponse(data.anime)
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        log(`   ⚠️  Fetch failed after ${MAX_RETRIES} attempts`)
      }
    }
  }
  return null
}

function parseATResponse(atData: any): ParsedAnime {
  const images    = atData.images    ?? []
  const resources = atData.resources ?? []
  const malId     = resources.find((r: any) => r.site === 'MyAnimeList')?.external_id ?? null
  const anilistId = resources.find((r: any) => r.site === 'AniList')?.external_id ?? null

  const themes: ParsedTheme[] = (atData.animethemes ?? []).map((t: any) => {
    const artists = t.song?.artists ?? []
    const type    = (t.type?.toUpperCase() ?? 'OP') as 'OP' | 'ED' | 'IN'
    const sequence = t.sequence ?? 1

    const entries: Entry[] = (t.animethemeentries ?? []).map((e: any) => {
      const videos: VideoSource[] = [...(e.videos ?? [])]
        .sort((a: any, b: any) => (b.resolution ?? 0) - (a.resolution ?? 0))
        .map((v: any) => ({
          resolution : v.resolution  ?? null,
          url        : v.link        ?? null,
          audioUrl   : v.audio?.link ?? null,
          audioSize  : v.audio?.size ?? null,
          source     : v.source      ?? null,
          nc         : v.nc          ?? false,
          lyrics     : v.lyrics      ?? false,
          subbed     : v.subbed      ?? false,
          uncen      : v.uncen       ?? false,
          overlap   : v.overlap     ?? null,
          size       : v.size        ?? null,
          tags       : v.tags        ?? null,
          basename  : v.basename    ?? null,
        }))

      return {
        version   : e.version  ?? 1,
        episodes  : e.episodes ?? null,
        isNsfw    : e.nsfw     ?? false,
        isSpoiler : e.spoiler  ?? false,
        notes     : e.notes    ?? null,
        videos,
      }
    })

    const firstOverlap = entries[0]?.videos?.[0]?.overlap
    const overlapNote  =
      firstOverlap === 'Over'       ? 'Plays over episode' :
      firstOverlap === 'Transition'   ? 'Transition overlap' : null

    const animeSlug = atData.slug ?? `anime-${t.id}`
    return {
      animethemesThemeId: t.id,
      slug              : `${animeSlug}-${type.toLowerCase()}${sequence}`,
      type,
      sequence,
      songTitle  : t.song?.title ?? 'Unknown',
      allArtists: artists.map((a: any) => a.name),
      artistSlugs: artists.map((a: any) => a.slug),
      artistRoles: artists.map((a: any) => a.as ?? 'performer'),
      entries,
      overlapNote,
    }
  })

  return {
    animeSlug            : atData.slug,
    animethemesId       : atData.id,
    animeTitle         : atData.name ?? 'Unknown',
    animeTitleEnglish   : null,
    animeTitleRomaji   : null,
    animeTitleNative   : null,
    animeTitleAlternative: (atData.animesynonyms ?? []).map((s: any) => s.text).filter(Boolean),
    animeSeason      : atData.season?.toUpperCase() ?? null,
    animeSeasonYear  : atData.year  ?? null,
    animeCoverImage  : images.find((i: any) => i.facet === 'Large Cover')?.link
                    ?? images.find((i: any) => i.facet === 'Small Cover')?.link ?? null,
    animeSmallCoverImage: images.find((i: any) => i.facet === 'Small Cover')?.link ?? null,
    animeBannerImage : images.find((i: any) => i.facet === 'Banner')?.link ?? null,
    animeGrillImage  : images.find((i: any) => i.facet === 'Grill')?.link  ?? null,
    animeSynopsis    : atData.synopsis ?? null,
    animeMediaFormat: atData.media_format ?? null,
    animeSeries    : (atData.series ?? []).map((s: any) => s.name).filter(Boolean),
    animeStudios   : (atData.studios ?? []).map((s: any) => s.name).filter(Boolean),
    animeSynonyms: (atData.animesynonyms ?? []).map((s: any) => s.text).filter(Boolean),
    malId,
    anilistId,
    kitsuId: null,
    themes,
    syncedAt: new Date(),
  }
}

async function upsertTheme(anime: ParsedAnime, theme: ParsedTheme): Promise<boolean> {
  const existing = await ThemeCache.findOne({ animethemesId: theme.animethemesThemeId })
  if (existing) {
    log(`   ⏭️  Already exists: "${theme.songTitle}"`)
    return false
  }

  const firstEntry = theme.entries[0]
  const bestVideo = firstEntry?.videos[0] ?? null

  const themeDoc = {
    slug: theme.slug,
    animethemesId: theme.animethemesThemeId,
    animeSlug: anime.animeSlug,
    animeBannerImage: anime.animeBannerImage,

    songTitle: theme.songTitle,
    allArtists: theme.allArtists,
    artistSlugs: theme.artistSlugs,
    artistRoles: theme.artistRoles,

    animeTitle: anime.animeTitle,
    animeTitleEnglish: anime.animeTitleEnglish,
    animeTitleAlternative: anime.animeTitleAlternative,
    animeSeason: anime.animeSeason,
    animeSeasonYear: anime.animeSeasonYear,
    animeCoverImage: anime.animeCoverImage,
    animeGrillImage: anime.animeGrillImage,
    animeSynopsis: anime.animeSynopsis,
    animeMediaFormat: anime.animeMediaFormat,
    animeSmallCoverImage: anime.animeSmallCoverImage,
    animeSeries: anime.animeSeries,
    animeStudios: anime.animeStudios,
    animeSynonyms: anime.animeSynonyms,

    anilistId: anime.anilistId,
    malId: anime.malId,

    type: theme.type,
    sequence: theme.sequence,
    overlapNote: theme.overlapNote,

    entries: theme.entries,

    videoUrl: bestVideo?.url ?? '',
    videoResolution: bestVideo?.resolution ?? null,
    videoSource: bestVideo?.source ?? null,
    hasLyrics: theme.entries.some(e => e.videos.some(v => v.lyrics)),
    isCreditless: theme.entries.some(e => e.videos.some(v => v.source === 'I')),

    syncedAt: new Date(),
  }

  await ThemeCache.findOneAndUpdate(
    { animethemesId: theme.animethemesThemeId },
    { $set: themeDoc },
    { upsert: true, returnDocument: 'after' }
  )

  return true
}

async function upsertArtists(themes: ParsedTheme[]): Promise<void> {
  const artistThemeIds = new Map<string, { name: string; ids: number[] }>()

  for (const theme of themes) {
    for (let i = 0; i < theme.allArtists.length; i++) {
      const name = theme.allArtists[i]
      const slug = theme.artistSlugs[i] ?? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      if (!artistThemeIds.has(slug)) {
        artistThemeIds.set(slug, { name, ids: [] })
      }
      artistThemeIds.get(slug)!.ids.push(theme.animethemesThemeId)
    }
  }

  for (const [slug, data] of artistThemeIds) {
    try {
      await ArtistCache.findOneAndUpdate(
        { slug },
        {
          $set: { name: data.name, syncedAt: new Date() },
          $addToSet: { themeAnimethemesIds: { $each: data.ids } }
        },
        { upsert: true, returnDocument: 'after' }
      )
    } catch (err) {
      log(`   ⚠️  Artist save failed: ${data.name}`)
    }
  }
}

async function processTheme(query: { anime: string; title: string; type: string }, index: number, total: number): Promise<void> {
  log(`\n[${index}/${total}] ${query.anime} → "${query.title}" (${query.type})`)

  const animeSearch = searchAnime(query.anime)
  if (!animeSearch) {
    log(`   ❌ Anime not found: ${query.anime}`)
    progress.failed++
    saveProgress()
    return
  }

  await sleep(DELAY_AT)

  const animeData = await fetchThemeDetails(animeSearch.slug)
  if (!animeData) {
    log(`   ❌ Failed to fetch details for: ${animeSearch.slug}`)
    progress.failed++
    saveProgress()
    return
  }

  const matchedTheme = animeData.themes.find(t =>
    t.songTitle.toLowerCase() === query.title.toLowerCase() &&
    t.type === query.type
  )

  if (!matchedTheme) {
    log(`   ⚠️  Theme not found: "${query.title}" (${query.type})`)
    log(`   Available: ${animeData.themes.map(t => `${t.type}${t.sequence}: ${t.songTitle}`).join(', ')}`)
    progress.failed++
    saveProgress()
    return
  }

  const saved = await upsertTheme(animeData, matchedTheme)
  if (saved) {
    await upsertArtists(animeData.themes)
    progress.processed++
  } else {
    progress.skipped++
  }

  progress.lastAnime = query.anime
  saveProgress()
}

async function main() {
  ensureDir()
  initLog()
  progress = loadProgress()

  div('═')
  log(`🎵 ANIMETHEMES SEED`)
  log(`   Total: ${progress.total}`)
  log(`   Processed: ${progress.processed}`)
  log(`   Skipped: ${progress.skipped}`)
  log(`   Failed: ${progress.failed}`)
  div('═')

  try {
    await connectDB()
    log('✅ Connected to database')
  } catch (err) {
    log(`❌ DB failed: ${err instanceof Error ? err.message : 'unknown'}`)
    process.exit(1)
  }

  await buildAnimeCache()

  const startIdx = progress.processed + progress.skipped + progress.failed
  const startFrom = progress.lastAnime

  let startIndex = 0
  if (startFrom) {
    const foundIdx = THEMES.findIndex(t => t.anime === startFrom)
    if (foundIdx !== -1) startIndex = foundIdx + 1
  } else {
    startIndex = startIdx
  }

  for (let i = startIndex; i < THEMES.length; i++) {
    await processTheme(THEMES[i], i + 1, THEMES.length)
  }

  div('═')
  log(`🎉 DONE! Processed: ${progress.processed} | Skipped: ${progress.skipped} | Failed: ${progress.failed}`)
  div('═')

  logStream?.end()
}

function ensureDir() {
  if (!fs.existsSync(SCRIPTS_DIR)) fs.mkdirSync(SCRIPTS_DIR, { recursive: true })
}

main().catch(err => {
  log(`❌ Fatal: ${err instanceof Error ? err.message : 'unknown'}`)
  logStream?.end()
  process.exit(1)
})