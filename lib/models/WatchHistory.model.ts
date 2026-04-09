import mongoose from 'mongoose'

const watchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    themeSlug: { type: String, required: true },
    lastWatchedAt: { type: Date, default: Date.now },
    watchCount: { type: Number, default: 1 },
  },
  { timestamps: true }
)

watchHistorySchema.index({ userId: 1, themeSlug: 1 }, { unique: true })

export default mongoose.models.WatchHistory || mongoose.model('WatchHistory', watchHistorySchema)
