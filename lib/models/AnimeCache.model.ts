import mongoose from 'mongoose'

const animeCacheSchema = new mongoose.Schema(
  {
    anilistId: { type: Number, required: true, unique: true },
    malId: { type: Number, default: null },
    titleRomaji: { type: String, required: true },
    titleEnglish: { type: String, default: null },
    titleNative: { type: String, default: null },
    synonyms: [String],
    season: { type: String, enum: ['WINTER', 'SPRING', 'SUMMER', 'FALL', null], default: null },
    seasonYear: { type: Number, default: null },
    genres: [String],
    coverImageLarge: { type: String, default: null },
    bannerImage: { type: String, default: null },
    atCoverImage: { type: String, default: null },
    atGrillImage: { type: String, default: null },
    totalEpisodes: { type: Number, default: null },
    status: { type: String, default: null },
    averageScore: { type: Number, default: null },
    syncedAt: { type: Date, required: true },
  },
  { timestamps: true }
)

animeCacheSchema.index({ anilistId: 1 })
animeCacheSchema.index({ malId: 1 })

export default mongoose.models.AnimeCache || mongoose.model('AnimeCache', animeCacheSchema)