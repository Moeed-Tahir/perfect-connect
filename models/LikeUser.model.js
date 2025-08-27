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
    mainCategory: {
        type: String,
        enum: ['hostFamily', 'auPair'],
        required: true
    },
    subCategory: {
        type: String,
        enum: ['isPairConnect', 'isPairHaven', 'isPairLink'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

LikeUserSchema.index({ likerId: 1, likedUserId: 1, mainCategory: 1, subCategory: 1 }, { unique: true });

const LikeUser = mongoose.model('LikeUser', LikeUserSchema);

module.exports = LikeUser;
