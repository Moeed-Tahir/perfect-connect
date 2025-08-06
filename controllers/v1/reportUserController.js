const ReportUser = require("../../models/ReportUser.model.js");
const User = require("../../models/User.model.js");
const mongoose = require("mongoose");

const reportUser = async (req, res) => {
    try {
        const { reporterId, reportedUserId, conditions, description } = req.body;

        if (!reporterId || !mongoose.Types.ObjectId.isValid(reporterId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reporter ID'
            });
        }

        if (!reportedUserId || !mongoose.Types.ObjectId.isValid(reportedUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reported user ID'
            });
        }

        if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one valid condition'
            });
        }

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid description'
            });
        }

        const [reporter, reportedUser] = await Promise.all([
            User.findById(reporterId),
            User.findById(reportedUserId)
        ]);

        if (!reporter) {
            return res.status(404).json({
                success: false,
                message: 'Reporter user not found'
            });
        }

        if (!reportedUser) {
            return res.status(404).json({
                success: false,
                message: 'Reported user not found'
            });
        }

        if (reporterId.toString() === reportedUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot report yourself'
            });
        }

        const newReport = new ReportUser({
            reporterId,
            reportedUserId,
            conditions,
            description
        });

        await newReport.save();

        return res.status(201).json({
            success: true,
            message: 'User reported successfully',
            report: newReport
        });

    } catch (error) {
        console.error('Error reporting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { reportUser }