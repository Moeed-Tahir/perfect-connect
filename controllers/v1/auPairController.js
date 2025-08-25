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
    const parseIfString = (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn(`Failed to parse JSON string: ${value}`);
          return value;
        }
      }
      return value;
    };

    let {
      userId,
      isPairConnect,
      isPairHaven,
      isPairLink,
      isPaused,
      isPairConnectPaused,
      isPairHavenPaused,
      isPairLinkPaused,
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
      profileImage = "",
      images = [],
      languages = [],
      pets = [],
      expNskills = [],
      temperament = [],
      thingsILove = [],
      favSpots = [],
      whatMakesMeSmile,
      agency,
      location
    } = req.body;

    agency = parseIfString(agency);
    location = parseIfString(location);
    whatMakesMeSmile = parseIfString(whatMakesMeSmile);
    languages = parseIfString(languages);
    pets = parseIfString(pets);
    expNskills = parseIfString(expNskills);
    temperament = parseIfString(temperament);
    thingsILove = parseIfString(thingsILove);
    favSpots = parseIfString(favSpots);

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    if (!isPairConnect && !isPairHaven && !isPairLink) {
      return res.status(400).json({
        success: false,
        code: "NO_PROGRAM_SELECTED",
        message: "At least one program must be selected",
      });
    }

    let existingUser = await User.findById(userId).select(
      "-password -otp -mobileOtp -__v"
    );
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    if (req.files?.profileImage) {
      const file = req.files.profileImage;
      const fileExtension = file.name.split(".").pop();
      const randomKey = `${uuidv4()}.${fileExtension}`;

      const params = {
        Bucket: "perfect-connect",
        Key: randomKey,
        Body: file.data,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      profileImage = uploadResult.Location;
    }

    if (req.files?.images) {
      const uploadedImages = [];
      const imagesArray = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const img of imagesArray) {
        const fileExtension = img.name.split(".").pop();
        const randomKey = `${uuidv4()}.${fileExtension}`;

        const params = {
          Bucket: "perfect-connect",
          Key: randomKey,
          Body: img.data,
          ContentType: img.mimetype,
        };

        const uploadResult = await s3.upload(params).promise();
        uploadedImages.push(uploadResult.Location);
      }

      images = uploadedImages;
    }

    const ensureArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const defaultAgency = {
      name: "",
      id: "",
      currentStatus: "",
      whichAgency: "",
      wouldChangeAgency: false,
      areYouCurrentlyHosting: false
    };

    const defaultLocation = {
      zipCode: "",
      state: "",
      city: "",
      infoAboutArea: "",
      country: "",
      nationality: "",
      hostFamilyExpectedLocation: ""
    };

    const defaultWhatMakesMeSmile = {
      category: "",
      description: ""
    };

    const updatedAuPair = {
      ...existingUser.auPair?.toObject(),
      isPairConnect: isPairConnect ?? existingUser.auPair?.isPairConnect,
      isPairHaven: isPairHaven ?? existingUser.auPair?.isPairHaven,
      isPairLink: isPairLink ?? existingUser.auPair?.isPairLink,
      isPaused: isPaused ?? existingUser.auPair?.isPaused,
      isPairConnectPaused: isPairConnectPaused ?? existingUser.auPair?.isPairConnectPaused,
      isPairHavenPaused: isPairHavenPaused ?? existingUser.auPair?.isPairHavenPaused,
      isPairLinkPaused: isPairLinkPaused ?? existingUser.auPair?.isPairLinkPaused,
      
      firstName: firstName ?? existingUser.auPair?.firstName,
      lastName: lastName ?? existingUser.auPair?.lastName,
      age: age ?? existingUser.auPair?.age,
      nationality: nationality ?? existingUser.auPair?.nationality,
      areYouFluent: areYouFluent ?? existingUser.auPair?.areYouFluent,
      availabilityDate: availabilityDate ?? existingUser.auPair?.availabilityDate,
      durationMonth: durationMonth ?? existingUser.auPair?.durationMonth,
      durationYear: durationYear ?? existingUser.auPair?.durationYear,
      religion: religion ?? existingUser.auPair?.religion,
      whichCountryAreYouFrom: whichCountryAreYouFrom ?? existingUser.auPair?.whichCountryAreYouFrom,
      aboutYourJourney: aboutYourJourney ?? existingUser.auPair?.aboutYourJourney,
      aboutYourself: aboutYourself ?? existingUser.auPair?.aboutYourself,
      aboutAuPair: aboutAuPair ?? existingUser.auPair?.aboutAuPair,
      usingPairLinkFor: usingPairLinkFor ?? existingUser.auPair?.usingPairLinkFor,
      isFluent: isFluent ?? existingUser.auPair?.isFluent,
      
      profileImage: profileImage || existingUser.auPair?.profileImage,
      images: images.length > 0 ? images : existingUser.auPair?.images || [],
      
      languages: ensureArray(languages) || existingUser.auPair?.languages || [],
      pets: ensureArray(pets) || existingUser.auPair?.pets || [],
      expNskills: ensureArray(expNskills) || existingUser.auPair?.expNskills || [],
      temperament: ensureArray(temperament) || existingUser.auPair?.temperament || [],
      thingsILove: ensureArray(thingsILove) || existingUser.auPair?.thingsILove || [],
      favSpots: ensureArray(favSpots) || existingUser.auPair?.favSpots || [],
      
      whatMakesMeSmile: {
        ...defaultWhatMakesMeSmile,
        ...(existingUser.auPair?.whatMakesMeSmile || {}),
        ...(whatMakesMeSmile || {})
      },
      
      agency: {
        ...defaultAgency,
        ...(existingUser.auPair?.agency || {}),
        ...(agency || {})
      },
      
      location: {
        ...defaultLocation,
        ...(existingUser.auPair?.location || {}),
        ...(location || {})
      }
    };

    // Update user
    existingUser.isAuPair = true;
    existingUser.auPair = updatedAuPair;

    const savedUser = await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Au Pair profile updated successfully",
      data: { user: savedUser },
    });
  } catch (error) {
    console.error("Error creating/updating au pair profile:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllAuPair = async (req, res) => {
  try {
    const { type, userId, page = 1, length = 10 } = req.body;

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

    // Fetch the user's liked Au Pair IDs
    const user = await User.findById(userId).select('likedAuPairs');
    const likedIds = user?.likedAuPairs || [];

    const results = await User.aggregate([
      { $match: matchQuery },
      { $sample: { size: length } },
      { $skip: (page - 1) * length },
      { $limit: length },
      {
        $addFields: {
          isLiked: { $in: ['$_id', likedIds] }
        }
      }
    ]);

    return res.status(200).json({ success: true, data: results, page, length });
  } catch (error) {
    console.error('Error in getAllAuPair:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const uploadTestImageToS3 = async (req, res) => {
  try {

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

const likeAuPairProfile = async (req, res) => {
    try {
        const { userId, status } = req.body;

        if (!userId || typeof status !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "userId and status (true/false) are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isAuPair || !user.auPair) {
            return res.status(400).json({
                success: false,
                message: "This user does not have an Au Pair profile"
            });
        }

        user.auPair.likeProfile = status;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Profile ${status ? 'liked' : 'unliked'} successfully`,
            data: {
                userId: user._id,
                likeProfile: user.auPair.likeProfile
            }
        });

    } catch (error) {
        console.error("Error in likeAuPairProfile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

module.exports = {
  createAuPairProfile,
  getAllAuPair,
  uploadTestImageToS3,
  pauseAuFamily,
  unpauseAuFamily,
  likeAuPairProfile
};