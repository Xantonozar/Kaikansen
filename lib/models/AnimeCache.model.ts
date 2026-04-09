import mongoose from 'mongoose'

const animeCacheSchema = new mongoose.Schema(
  {
    anilistId: { type: Number, required: true, unique: true },
    title: String,
    titleAlternative: String,
    description: String,
    year: Number,
    season: String,
    coverImage: String,
    bannerImage: String,
    status: String,
    episodeCount: Number,
    averageScore: Number,
    popularity: Number,
    genres: [String],
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.models.AnimeCache || mongoose.model('AnimeCache', animeCacheSchema)
