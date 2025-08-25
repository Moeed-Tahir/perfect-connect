const mongoose = require('mongoose');

const connectionUserSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commonalities: {
    type: Object,
    default: { message: "No commonalities found" }
  }
}, { timestamps: true });

connectionUserSchema.index({ reporterId: 1, reportedUserId: 1 }, { unique: true });

module.exports = mongoose.model('ConnectionUser', connectionUserSchema);