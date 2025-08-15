const mongoose = require('mongoose');

const LikeUserSchema = new mongoose.Schema({
    likerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const LikeUser = mongoose.model('LikeUser', LikeUserSchema);

module.exports = LikeUser;
