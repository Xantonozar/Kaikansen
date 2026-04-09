import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['friend_request', 'friend_accepted', 'followed', 'rating'], required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedThemeSlug: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, isRead: 1 })

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
