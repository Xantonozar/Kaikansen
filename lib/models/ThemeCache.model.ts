import mongoose from 'mongoose'

const themeCacheSchema = new mongoose.Schema({
  // === PRIMARY ===
  // slug is NOT unique - duplicates allowed (some anime have multiple versions of same theme)
  // Use animethemesId as the true unique identifier
  slug: { type: String, default: null },
  animethemesId: { type: Number, required: true, unique: true, index: true },
  
  // === ANIME IDENTIFIER (for anime-level queries) ===
  animeSlug: { type: String, index: true },
  animeBannerImage: { type: String, default: null },
  
  // === SONG ===
  songTitle: { type: String, required: true },
  artistName: { type: String, default: null },
  allArtists: [String],
  artistSlugs: [String],
  artistRoles: [String],
  
  // === ANIME (Basic) ===
  anilistId: { type: Number, default: null },
  animeTitle: { type: String, required: true },
  animeTitleEnglish: { type: String, default: null },
  animeTitleAlternative: [String],
  animeSeason: { type: String, enum: ['WINTER', 'SPRING', 'SUMMER', 'FALL', null], default: null },
  animeSeasonYear: { type: Number, default: null },
  animeCoverImage: { type: String, default: null },
  animeGrillImage: { type: String, default: null },
  
  // === ANIME (NEW) ===
  animeSynopsis: { type: String, default: null },
  animeMediaFormat: { type: String, default: null },
  animeSmallCoverImage: { type: String, default: null },
  animeSeries: [String],
  animeStudios: [String],
  animeSynonyms: [String],
  
  // === THEME ===
  type: { type: String, enum: ['OP', 'ED'], required: true, index: true },
  sequence: { type: Number, required: true },
  
  // === ENTRIES (ALL VERSIONS - NEW) ===
  entries: [{
    version: { type: Number, default: 1 },
    episodes: { type: String, default: null },
    isNsfw: { type: Boolean, default: false },
    isSpoiler: { type: Boolean, default: false },
    notes: { type: String, default: null },
    videos: [{
      resolution: { type: Number, required: true },
      url: { type: String, required: true },
      source: { type: String, default: null },
      nc: { type: Boolean, default: false },
      lyrics: { type: Boolean, default: false },
      subbed: { type: Boolean, default: false },
      overlap: { type: String, default: null }
    }]
  }],
  
  // === PRIMARY VIDEO (Backward Compat) ===
  videoUrl: { type: String, required: true },
  videoResolution: { type: Number, default: null },
  videoSource: { type: String, default: null },
  hasLyrics: { type: Boolean, default: false },
  isCreditless: { type: Boolean, default: false },
  overlapNote: { type: String, default: null },
  
  // === USER STATS ===
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalWatches: { type: Number, default: 0 },
  totalListens: { type: Number, default: 0 },
  
  // === METADATA ===
  syncedAt: { type: Date, required: true },
}, { timestamps: true })

// Text search index
themeCacheSchema.index(
  { songTitle: 'text', artistName: 'text', allArtists: 'text', animeTitle: 'text', animeTitleEnglish: 'text', animeTitleAlternative: 'text' },
  { weights: { songTitle: 10, artistName: 9, allArtists: 8, animeTitle: 6, animeTitleEnglish: 5, animeTitleAlternative: 3 }, name: 'theme_full_search' }
)

// Functional indexes
themeCacheSchema.index({ animeSeason: 1, animeSeasonYear: 1 })
themeCacheSchema.index({ avgRating: -1, totalRatings: -1 })
themeCacheSchema.index({ totalWatches: -1 })
themeCacheSchema.index({ artistSlugs: 1 })
themeCacheSchema.index({ anilistId: 1 })

export default mongoose.models.ThemeCache || mongoose.model('ThemeCache', themeCacheSchema)