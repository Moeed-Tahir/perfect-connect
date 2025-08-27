const mongoose = require('mongoose');

const connectionUserSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commonalities: {
    type: Object,
    default: { message: "No commonalities found" }
  },
}, { timestamps: true });

connectionUserSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

module.exports = mongoose.model('ConnectionUser', connectionUserSchema);