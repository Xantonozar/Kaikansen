import mongoose from 'mongoose'

const themeCacheSchema = new mongoose.Schema(
  {
    themeId: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    songTitle: { type: String, required: true },
    type: { type: String, enum: ['OP', 'ED'], required: true },
    sequence: Number,
    year: Number,
    season: String,
    anilistId: Number,
    animeTitle: String,
    animeTitleAlternative: String,
    animeCoverImage: String,
    videoSources: [
      {
        resolution: Number,
        url: String,
      },
    ],
    artistSlugs: [String],
    allArtists: [String],
    artistRoles: [
      {
        name: String,
        role: String,
      },
    ],
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

themeCacheSchema.index({ songTitle: 'text', artistName: 'text', allArtists: 'text', animeTitle: 'text', animeTitleAlternative: 'text' })

export default mongoose.models.ThemeCache || mongoose.model('ThemeCache', themeCacheSchema)
