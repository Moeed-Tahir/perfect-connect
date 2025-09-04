const mongoose = require('mongoose');

const connectionUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  connections: [
    {
      user: {
        type: Object,  
        required: true
      },
      commonalities: {
        type: Object,
        default: { message: "No commonalities found" }
      }
    }
  ]
}, { timestamps: true });

connectionUserSchema.index(
  { userId: 1, "connections.user._id": 1 },
  { unique: true }
);

module.exports = mongoose.model('ConnectionUser', connectionUserSchema);
