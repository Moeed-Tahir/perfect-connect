const AWS = require('aws-sdk');
const User = require("../../models/User.model.js");
const mongoose = require("mongoose");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2'
});

const createAuPairProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    let {
      // Type flags
      isPairConnect = false,
      isPairHaven = false,
      isPairLink = false,

      // Basic Info
      firstName,
      lastName,
      age,
      nationality,
      areYouFluent,
      availabilityDate,
      durationMonth,
      durationYear,
      religion,
      whichCountryAreYouFrom,
      aboutYourJourney,
      aboutYourself,
      aboutAuPair,
      usingPairLinkFor,
      isFluent,
      profileImage,

      // Lists
      images = [],
      languages = [],
      pets = [],
      expNskills = [],
      temperament = [],
      thingsILove = [],
      favSpots = [],

      // Object field
      whatMakesMeSmile = {},

      // Nested Models
      agency,
      location
    } = req.body;

    if (!isPairConnect && !isPairHaven && !isPairLink) {
      return res.status(400).json({ message: "At least one au pair type must be selected" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isAuPair = true;

    user.auPair = {
      // Type Flags
      isPairConnect,
      isPairHaven,
      isPairLink,

      // Basic Info
      age,
      firstName,
      lastName,
      nationality,
      areYouFluent,
      availabilityDate,
      durationMonth,
      durationYear,
      religion,
      whichCountryAreYouFrom,
      aboutYourJourney,
      aboutYourself,
      aboutAuPair,
      usingPairLinkFor,
      isFluent,
      profileImage,

      // Lists
      images: Array.isArray(images) ? images : [],
      languages: Array.isArray(languages) ? languages : [],
      pets: Array.isArray(pets) ? pets : [],
      expNskills: Array.isArray(expNskills) ? expNskills : [],
      temperament: Array.isArray(temperament) ? temperament : [],
      thingsILove: Array.isArray(thingsILove) ? thingsILove : [],
      favSpots: Array.isArray(favSpots) ? favSpots : [],

      // Object Field
      whatMakesMeSmile: {
        category: whatMakesMeSmile.category || "",
        description: whatMakesMeSmile.description || ""
      },

      // Nested Models
      agency: agency || {
        name: "",
        id: "",
        currentStatus: "",
        whichAgency: "",
        wouldChangeAgency: false,
        areYouCurrentlyHosting: false
      },
      location: location || {
        zipCode: "",
        state: "",
        city: "",
        infoAboutArea: "",
        country: "",
        nationality: "",
        hostFamilyExpectedLocation: ""
      }
    };

    await user.save();

    return res.status(200).json({
      message: "Au Pair profile created/updated successfully",
      data: {
        user: user.toObject()
      }
    });

  } catch (error) {
    console.error("Error creating au pair profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const getAllAuPair = async (req, res) => {
  try {
    const { type, page = 1, length = 10 } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Type is required' });
    }

    let matchQuery = { isAuPair: true };

    if (type === 'pairConnect') {
      matchQuery['auPair.isPairConnect'] = true;
    } else if (type === 'pairHaven') {
      matchQuery['auPair.isPairHaven'] = true;
    } else if (type === 'pairLink') {
      matchQuery['auPair.isPairLink'] = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type value' });
    }

    const results = await User.aggregate([
      { $match: matchQuery },
      { $sample: { size: length } },
      { $skip: (page - 1) * length },
      { $limit: length }
    ]);

    return res.status(200).json({ success: true, data: results, page, length });
  } catch (error) {
    console.error('Error in getAllAuPair:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const uploadTestImageToS3 = async (req, res) => {
  try {
    console.log("Call");
    console.log("sjksjs", req.file);

    if (!req.files || !req.files.TestImage) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded with the name "TestImage"',
      });
    }


    const testImage = req.files.TestImage;

    const params = {
      Bucket: "perfect-connect",
      Key: 'TestImage',
      Body: testImage.data,
      ContentType: testImage.mimetype
    };

    const uploadResult = await s3.upload(params).promise();

    return res.status(200).json({
      success: true,
      message: 'TestImage uploaded to S3 successfully',
      data: {
        location: uploadResult.Location,
        key: uploadResult.Key,
        bucket: uploadResult.Bucket,
        // You might also want to include:
        // size: testImage.size,
        // mimetype: testImage.mimetype
      }
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading TestImage to S3',
      error: error.message
      // In production, you might not want to send the full error message
    });
  }
};

const pauseAuFamily = async (req, res) => {
  try {
    const { userId, type } = req.body;
    console.log("type", type);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!type || !['pairConnect', 'pairHaven', 'pairLink'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "pairConnect", "pairHaven" or "pairLink"'
      });
    }

    const user = await User.findOne({
      _id: userId,
      isAuPair: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Au pair not found'
      });
    }

    const typeField = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (!user.auPair || user.auPair[typeField] !== true) {
      return res.status(400).json({
        success: false,
        message: `This au pair is not registered as ${type}`
      });
    }

    user.auPair.isPaused = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Au pair ${type} paused successfully`,
      data: {
        userId: user._id,
        type,
        isPaused: true
      }
    });

  } catch (error) {
    console.error('Error in pauseAuFamily:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const unpauseAuFamily = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!type || !['pairConnect', 'pairHaven', 'pairLink'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "pairConnect", "pairHaven" or "pairLink"'
      });
    }

    const user = await User.findOne({
      _id: userId,
      isAuPair: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Au pair not found'
      });
    }

    const typeField = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (!user.auPair || user.auPair[typeField] !== true) {
      return res.status(400).json({
        success: false,
        message: `This au pair is not registered as ${type}`
      });
    }

    user.auPair.isPaused = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Au pair ${type} unpaused successfully`,
      data: {
        userId: user._id,
        type,
        isPaused: false
      }
    });

  } catch (error) {
    console.error('Error in unpauseAuFamily:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createAuPairProfile,
  getAllAuPair,
  uploadTestImageToS3,
  pauseAuFamily,
  unpauseAuFamily
};