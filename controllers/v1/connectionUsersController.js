const ConnectionUser = require('../../models/ConnectionUser.model');

const addConnection = async (req, res) => {
    try {
        const { reporterId, reportedUserId } = req.body;

        const existingConnection = await ConnectionUser.findOne({ reporterId, reportedUserId });
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: 'Connection already exists'
            });
        }

        if (reporterId.toString() === reportedUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot connect to yourself'
            });
        }

        const newConnection = await ConnectionUser.create({ reporterId, reportedUserId });

        res.status(201).json({
            success: true,
            message: 'Connection added successfully',
            data: newConnection
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeConnection = async (req, res) => {
    try {
        const { reporterId, reportedUserId } = req.body;

        const deletedConnection = await ConnectionUser.findOneAndDelete({
            reporterId,
            reportedUserId
        });

        if (!deletedConnection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Connection removed successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getConnectionsByReporter = async (req, res) => {
    try {
        const { reporterId } = req.params;

        const connections = await ConnectionUser.find({ reporterId })
            .populate('reportedUserId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: connections.length,
            data: connections
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addConnection,
    removeConnection,
    getConnectionsByReporter
};