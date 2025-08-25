const ConnectionUser = require('../../models/ConnectionUser.model');
const User = require('../../models/User.model');
const LikeUser = require('../../models/LikeUser.model');

// Helper function to find commonalities between two users
const findCommonalities = async (reporterId, reportedUserId) => {
  try {
    const reporter = await User.findById(reporterId);
    const reportedUser = await User.findById(reportedUserId);

    if (!reporter || !reportedUser) {
      return { success: false, message: 'Users not found' };
    }

    const commonalities = {
      basic: [],
      lifestyle: [],
      preferences: [],
      location: [],
      children: [],
      schedule: [],
      interests: []
    };

    let hasAnyCommonality = false;

    // Basic information comparison
    if (reporter.nationality && reportedUser.nationality && 
        reporter.nationality === reportedUser.nationality) {
      commonalities.basic.push(`Same nationality: ${reporter.nationality}`);
      hasAnyCommonality = true;
    }

    if (reporter.religion && reportedUser.religion && 
        reporter.religion === reportedUser.religion) {
      commonalities.basic.push(`Same religion: ${reporter.religion}`);
      hasAnyCommonality = true;
    }

    // For Host Family to Au Pair matching
    if (reporter.isHostFamily && reportedUser.isAuPair) {
      const hostFamily = reporter.hostFamily;
      const auPair = reportedUser.auPair;

      if (hostFamily && auPair) {
        // Duration matching
        if (hostFamily.durationYear && auPair.durationYear && 
            hostFamily.durationYear === auPair.durationYear) {
          commonalities.basic.push(`Same preferred duration: ${hostFamily.durationYear} year(s)`);
          hasAnyCommonality = true;
        }

        // Language compatibility
        if (hostFamily.primaryLanguage && auPair.areYouFluent && 
            hostFamily.primaryLanguage === auPair.areYouFluent) {
          commonalities.basic.push(`Language compatibility: ${hostFamily.primaryLanguage}`);
          hasAnyCommonality = true;
        }

        // Pets compatibility
        const hostPets = hostFamily.pets || [];
        const auPairPets = auPair.pets || [];
        const commonPets = hostPets.filter(pet => auPairPets.includes(pet));
        if (commonPets.length > 0) {
          commonalities.lifestyle.push(`Common pets: ${commonPets.join(', ')}`);
          hasAnyCommonality = true;
        }
      }
    }

    // For Au Pair to Host Family matching
    if (reporter.isAuPair && reportedUser.isHostFamily) {
      const auPair = reporter.auPair;
      const hostFamily = reportedUser.hostFamily;

      if (auPair && hostFamily) {
        // Duration matching
        if (auPair.durationYear && hostFamily.durationYear && 
            auPair.durationYear === hostFamily.durationYear) {
          commonalities.basic.push(`Same preferred duration: ${auPair.durationYear} year(s)`);
          hasAnyCommonality = true;
        }

        // Language compatibility
        if (hostFamily.primaryLanguage && auPair.areYouFluent && 
            hostFamily.primaryLanguage === auPair.areYouFluent) {
          commonalities.basic.push(`Language compatibility: ${hostFamily.primaryLanguage}`);
          hasAnyCommonality = true;
        }

        // Pets compatibility
        const auPairPets = auPair.pets || [];
        const hostPets = hostFamily.pets || [];
        const commonPets = auPairPets.filter(pet => hostPets.includes(pet));
        if (commonPets.length > 0) {
          commonalities.lifestyle.push(`Common pets: ${commonPets.join(', ')}`);
          hasAnyCommonality = true;
        }
      }
    }

    // If no commonalities found, add a message
    if (!hasAnyCommonality) {
      commonalities.message = "No commonalities found between users";
    }

    return { 
      success: true, 
      commonalities,
      hasCommonalities: hasAnyCommonality
    };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

// @desc    Create a connection (like + get commonalities)
// @route   POST /api/connections
// @access  Private
const addConnection = async (req, res) => {
  try {
    const { reporterId, reportedUserId } = req.body;

    // Validation
    if (!reporterId || !reportedUserId) {
      return res.status(400).json({
        success: false,
        message: 'reporterId and reportedUserId are required'
      });
    }

    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect to yourself'
      });
    }

    // Check if connection already exists
    const existingConnection = await ConnectionUser.findOne({ reporterId, reportedUserId });
    if (existingConnection) {
      // Return existing connection with commonalities
      return res.status(200).json({
        success: true,
        message: 'Connection already exists',
        data: {
          connection: existingConnection,
          commonalities: existingConnection.communalities || { message: "No commonalities found" }
        }
      });
    }

    // Check if like exists, if not create one
    const existingLike = await LikeUser.findOne({ likerId: reporterId, likedUserId: reportedUserId });
    if (!existingLike) {
      await LikeUser.create({ likerId: reporterId, likedUserId: reportedUserId });
    }

    // Find commonalities between users
    const commonalitiesResult = await findCommonalities(reporterId, reportedUserId);
    if (!commonalitiesResult.success) {
      return res.status(400).json({
        success: false,
        message: commonalitiesResult.message
      });
    }

    // Create connection with commonalities
    const newConnection = await ConnectionUser.create({ 
      reporterId, 
      reportedUserId,
      commonalities: commonalitiesResult.communalities
    });

    res.status(201).json({
      success: true,
      message: 'Connection added successfully',
      data: {
        connection: newConnection,
        commonalities: commonalitiesResult.communalities
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove a connection
// @route   DELETE /api/connections
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const { reporterId, reportedUserId } = req.body;

    // Validation
    if (!reporterId || !reportedUserId) {
      return res.status(400).json({
        success: false,
        message: 'reporterId and reportedUserId are required'
      });
    }

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

    // Also remove the like if it exists
    await LikeUser.findOneAndDelete({
      likerId: reporterId,
      likedUserId: reportedUserId
    });

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

// @desc    Get all connections for a reporter with commonalities
// @route   GET /api/connections/:reporterId
// @access  Private
const getConnectionsByReporter = async (req, res) => {
  try {
    const { reporterId } = req.params;

    if (!reporterId) {
      return res.status(400).json({
        success: false,
        message: 'reporterId is required'
      });
    }

    const connections = await ConnectionUser.find({ reporterId })
      .populate('reportedUserId')
      .sort({ createdAt: -1 });

    // Ensure each connection has commonalities field
    const connectionsWithCommonalities = connections.map(connection => ({
      ...connection.toObject(),
      commonalities: connection.communalities || { message: "No commonalities found" }
    }));

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connectionsWithCommonalities
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get commonalities between two specific users
// @route   GET /api/connections/commonalities/:reporterId/:reportedUserId
// @access  Private
const getCommonalities = async (req, res) => {
  try {
    const { reporterId, reportedUserId } = req.params;

    if (!reporterId || !reportedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Both reporterId and reportedUserId are required'
      });
    }

    const commonalitiesResult = await findCommonalities(reporterId, reportedUserId);
    
    if (!commonalitiesResult.success) {
      return res.status(400).json({
        success: false,
        message: commonalitiesResult.message
      });
    }

    res.status(200).json({
      success: true,
      data: commonalitiesResult.communalities
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
  getConnectionsByReporter,
  getCommonalities
};