const mongoose = require('mongoose');

const connectionUserSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  userObjects: [{
    type: Object,
    required: true
  }],
  commonalities: {
    type: Object,
    default: { message: "No commonalities found" }
  }
}, { timestamps: true });

connectionUserSchema.index(
  { users: 1 },
  { unique: true }
);

module.exports = mongoose.model('ConnectionUser', connectionUserSchema);
