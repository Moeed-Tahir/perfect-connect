const ConnectionUser = require('../../models/ConnectionUser.model');

const getAllConnections = async (req, res) => {
  try {
    const connections = await ConnectionUser.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections
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
