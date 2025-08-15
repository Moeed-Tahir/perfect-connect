const AWS = require('aws-sdk');
const User = require("../../models/User.model.js");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const ObjectId = mongoose.Types.ObjectId;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2'
});

const createAuPairProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    let {
      isPairConnect = false,
      isPairHaven = false,
      isPairLink = false,
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
      images = [],
      languages = [],
      pets = [],
      expNskills = [],
      temperament = [],
      thingsILove = [],
      favSpots = [],
      whatMakesMeSmile = {},
      agency,
      location
    } = req.body;

    if (!isPairConnect && !isPairHaven && !isPairLink) {
      return res.status(400).json({ message: "At least one au pair type must be selected" });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage;
      const fileExtension = file.name.split('.').pop();
      const randomKey = `${uuidv4()}.${fileExtension}`;

      const params = {
        Bucket: "perfect-connect",
        Key: randomKey,
        Body: file.data,
        ContentType: file.mimetype
      };

      const uploadResult = await s3.upload(params).promise();
      profileImage = uploadResult.Location;
    }

    if (req.files && req.files.images) {
      const uploadedImages = [];

      const imagesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const img of imagesArray) {
        const fileExtension = img.name.split('.').pop();
        const randomKey = `${uuidv4()}.${fileExtension}`;

        const params = {
          Bucket: "perfect-connect",
          Key: randomKey,
          Body: img.data,
          ContentType: img.mimetype
        };

        const uploadResult = await s3.upload(params).promise();
        uploadedImages.push(uploadResult.Location);
      }

      images = uploadedImages;
    }

    user.isAuPair = true;
    user.auPair = {
      isPairConnect,
      isPairHaven,
      isPairLink,
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
      images,
      languages: Array.isArray(languages) ? languages : [],
      pets: Array.isArray(pets) ? pets : [],
      expNskills: Array.isArray(expNskills) ? expNskills : [],
      temperament: Array.isArray(temperament) ? temperament : [],
      thingsILove: Array.isArray(thingsILove) ? thingsILove : [],
      favSpots: Array.isArray(favSpots) ? favSpots : [],
      whatMakesMeSmile: {
        category: whatMakesMeSmile.category || "",
        description: whatMakesMeSmile.description || ""
      },
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
      data: { user: user.toObject() }
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

    const fileExtension = testImage.name.split('.').pop();
    const randomKey = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: "perfect-connect",
      Key: randomKey,
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
        size: testImage.size,
        mimetype: testImage.mimetype
      }
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading TestImage to S3',
      error: error.message
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
    const pauseField = `${typeField}Paused`;
    if (!user.auPair || user.auPair[typeField] !== true) {
      return res.status(400).json({
        success: false,
        message: `This au pair is not registered as ${type}`
      });
    }

    user.auPair[pauseField] = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Au pair ${type} paused successfully`,
      data: {
        userId: user._id,
        type,
        [pauseField]: true
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
    const pauseField = `${typeField}Paused`;
    if (!user.auPair || user.auPair[typeField] !== true) {
      return res.status(400).json({
        success: false,
        message: `This au pair is not registered as ${type}`
      });
    }

    user.auPair[pauseField] = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Au pair ${type} unpaused successfully`,
      data: {
        userId: user._id,
        type,
        [pauseField]: false
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