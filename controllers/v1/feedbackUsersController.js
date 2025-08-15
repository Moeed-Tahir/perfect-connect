const FeedbackUser = require('../../models/Feedback.model');

const sendFeedback = async (req, res) => {
    try {
        const { feedbackCategory, feedbackMessage, email } = req.body;

        if (!feedbackCategory || !feedbackMessage || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields (feedbackCategory, feedbackMessage, email) are required'
            });
        }

        const newFeedback = await FeedbackUser.create({
            feedbackCategory,
            feedbackMessage,
            email
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await FeedbackUser.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'All feedback retrieved successfully',
            data: feedbacks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    sendFeedback,
    getAllFeedback
};