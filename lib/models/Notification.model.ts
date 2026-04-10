import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['friend_request', 'friend_accepted', 'friend_rated', 'friend_favorited', 'follow'], 
      required: true 
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityMeta: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ recipientId: 1, read: 1 })
notificationSchema.index({ recipientId: 1, createdAt: -1 })

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)