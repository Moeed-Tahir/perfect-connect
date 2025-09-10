const ConnectionUser = require('../../models/ConnectionUser.model');
const mongoose = require("mongoose");

const getAllConnections = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required in the request body'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    const connections = await ConnectionUser.find({
      users: { $in: [new mongoose.Types.ObjectId(userId)] }
    }).sort({ createdAt: -1 });

    const connectedUsers = connections.flatMap(connection => 
      connection.userObjects.filter(userObj => 
        userObj._id.toString() !== userId
      )
    );

    res.status(200).json({
      success: true,
      count: connectedUsers.length,
      data: connectedUsers
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching connections',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllConnections
};
