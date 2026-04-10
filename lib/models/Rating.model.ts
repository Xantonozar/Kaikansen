import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThemeCache', required: true },
    themeSlug: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    mode: { type: String, enum: ['watch', 'listen'], required: true },
  },
  { timestamps: true }
)

ratingSchema.index({ userId: 1, themeId: 1 }, { unique: true })
ratingSchema.index({ userId: 1 })
ratingSchema.index({ themeId: 1 })

ratingSchema.post('save', async function() {
  const stats = await mongoose.model('Rating').aggregate([
    { $match: { themeId: this.themeId } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
  ])
  await mongoose.model('ThemeCache').findByIdAndUpdate(this.themeId, {
    avgRating: parseFloat((stats[0]?.avg ?? 0).toFixed(2)),
    totalRatings: stats[0]?.count ?? 0,
  })
  await mongoose.model('User').findByIdAndUpdate(
    this.userId,
    { $inc: { totalRatings: 1 } }
  )
})

export default mongoose.models.Rating || mongoose.model('Rating', ratingSchema)