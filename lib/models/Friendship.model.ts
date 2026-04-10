import mongoose from 'mongoose'

const friendshipSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addresseeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  },
  { timestamps: true }
)

friendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true })
friendshipSchema.index({ requesterId: 1, status: 1 })
friendshipSchema.index({ addresseeId: 1, status: 1 })

export default mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema)