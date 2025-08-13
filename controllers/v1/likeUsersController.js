const LikeUser = require('../../models/LikeUser.model');

const createLike = async (req, res) => {
    try {
        const { likerId, likedUserId } = req.body;

        const existingLike = await LikeUser.findOne({ likerId, likedUserId });
        if (existingLike) {
            return res.status(400).json({
                success: false,
                message: 'User already liked'
            });
        }

        const newLike = await LikeUser.create({ likerId, likedUserId });

        res.status(201).json({
            success: true,
            data: newLike
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteLike = async (req, res) => {
    try {
        const { likerId, likedUserId } = req.body;

        const deletedLike = await LikeUser.findOneAndDelete({
            likerId,
            likedUserId
        });

        if (!deletedLike) {
            return res.status(404).json({
                success: false,
                message: 'Like not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Like removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getLikesByReporter = async (req, res) => {
    try {
        const { likerId } = req.body;

        const likes = await LikeUser.find({ likerId })
            .populate('likedUserId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: likes.length,
            data: likes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { createLike, deleteLike, getLikesByReporter }