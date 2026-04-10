import mongoose from 'mongoose'

const themeCacheSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    animethemesId: { type: Number, required: true, unique: true },
    songTitle: { type: String, required: true },
    artistName: { type: String, default: null },
    allArtists: [String],
    artistSlugs: [String],
    artistRoles: [String],
    anilistId: { type: Number, default: null },
    animeTitle: { type: String, required: true },
    animeTitleEnglish: { type: String, default: null },
    animeTitleAlternative: [String],
    animeSeason: { type: String, enum: ['WINTER', 'SPRING', 'SUMMER', 'FALL', null], default: null },
    animeSeasonYear: { type: Number, default: null },
    animeCoverImage: { type: String, default: null },
    animeGrillImage: { type: String, default: null },
    type: { type: String, enum: ['OP', 'ED'], required: true },
    sequence: { type: Number, required: true },
    episodesCovered: { type: String, default: null },
    videoSources: [
      {
        resolution: { type: Number, required: true },
        url: { type: String, required: true },
        tags: [String],
      },
    ],
    videoUrl: { type: String, required: true },
    videoResolution: { type: Number, default: null },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalWatches: { type: Number, default: 0 },
    totalListens: { type: Number, default: 0 },
    syncedAt: { type: Date, required: true },
  },
  { timestamps: true }
)

themeCacheSchema.index(
  { songTitle: 'text', artistName: 'text', allArtists: 'text', animeTitle: 'text', animeTitleEnglish: 'text', animeTitleAlternative: 'text' },
  { weights: { songTitle: 10, artistName: 9, allArtists: 8, animeTitle: 6, animeTitleEnglish: 5, animeTitleAlternative: 3 }, name: 'theme_full_search' }
)
themeCacheSchema.index({ animeSeason: 1, animeSeasonYear: 1 })
themeCacheSchema.index({ avgRating: -1, totalRatings: -1 })
themeCacheSchema.index({ totalWatches: -1 })
themeCacheSchema.index({ artistSlugs: 1 })
themeCacheSchema.index({ type: 1 })
themeCacheSchema.index({ anilistId: 1 })

export default mongoose.models.ThemeCache || mongoose.model('ThemeCache', themeCacheSchema)