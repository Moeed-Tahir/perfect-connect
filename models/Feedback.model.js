const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema({
    feedbackCategory: {
        type: String,
        required: [true, 'Feedback category is required'],
    },
    feedbackMessage: {
        type: String,
        required: [true, 'Feedback message is required'],
        minlength: [10, 'Feedback message must be at least 10 characters long'],
        maxlength: [1000, 'Feedback message cannot exceed 1000 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const FeedbackUser = mongoose.model('FeedbackUser', userFeedbackSchema);

module.exports = FeedbackUser;