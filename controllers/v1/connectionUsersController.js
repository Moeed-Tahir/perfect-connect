const ConnectionUser = require('../../models/ConnectionUser.model');

const getAllConnections = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;

    const pageNum = parseInt(page); 
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalConnections = await ConnectionUser.countDocuments();

    const connections = await ConnectionUser.find()
      .populate('user1Id', 'username email firstName lastName')
      .populate('user2Id', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalConnections / limitNum);

    res.status(200).json({
      success: true,
      count: connections.length,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalConnections: totalConnections,
      },
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
}