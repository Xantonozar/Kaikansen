import mongoose from 'mongoose'

const watchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeCache', required: true },
    themeSlug: { type: String, required: true },
    mode: { type: String, enum: ['watch', 'listen'], required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

watchHistorySchema.index({ userId: 1, viewedAt: -1 })
watchHistorySchema.index({ themeId: 1 })
watchHistorySchema.index({ viewedAt: -1 })

watchHistorySchema.post('save', async function() {
  const field = this.mode === 'watch' ? 'totalWatches' : 'totalListens'
  await mongoose.model('ThemeCache')
    .findByIdAndUpdate(this.themeId, { $inc: { [field]: 1 } })
})

export default mongoose.models.WatchHistory || mongoose.model('WatchHistory', watchHistorySchema)