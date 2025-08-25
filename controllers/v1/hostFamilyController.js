const mongoose = require("mongoose");
const User = require("../../models/User.model.js");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2'
});

const createHostFamily = async (req, res) => {
  try {
    const parseIfString = (value) => {
      if (typeof value === 'string') {
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
      isPaused = false, 
      isPairConnectPaused = false, 
      isPairHavenPaused = false, 
      familyStructure,
      familyName,
      primaryLanguage,
      secondaryLanguage,
      availabilityDate,
      durationYear,
      durationMonth,
      religion,
      aboutYourFamily,
      spaceInHome,
      householdAtmosphere,
      profileImage = "",
      pets = [],
      images = [],
      benefits = [],
      dietaryPrefs = [],
      noOfChildren = 0,
      children = [],
      schedule = {},
      firstParent,
      secondParent,
      agency,
      location,
      requiredAuPairModel,
      optionalAuPairModel
    } = req.body;

    firstParent = parseIfString(firstParent);
    secondParent = parseIfString(secondParent);
    agency = parseIfString(agency);
    location = parseIfString(location);
    requiredAuPairModel = parseIfString(requiredAuPairModel);
    optionalAuPairModel = parseIfString(optionalAuPairModel);
    pets = parseIfString(pets);
    benefits = parseIfString(benefits);
    dietaryPrefs = parseIfString(dietaryPrefs);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId is required',
      });
    }

    if (!isPairConnect && !isPairHaven) {
      return res.status(400).json({
        success: false,
        code: "NO_PROGRAM_SELECTED",
        message: "At least one program must be selected"
      });
    }

    if (isPairConnect && !isPairHaven && noOfChildren !== children.length) {
      return res.status(400).json({
        success: false,
        message: "Number of children does not match children array length"
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

    let parsedSchedule = schedule;
    if (typeof schedule === 'string') {
      try {
        parsedSchedule = JSON.parse(schedule);
      } catch (error) {
        console.warn('Failed to parse schedule JSON, using empty object');
        parsedSchedule = {};
      }
    }

    let parsedChildren = children;
    if (typeof children === 'string') {
      try {
        parsedChildren = JSON.parse(children);
      } catch (error) {
        console.warn('Failed to parse children JSON, using empty array');
        parsedChildren = [];
      }
    }

    const defaultParent = {
      age: 0,
      firstName: "",
      lastName: "",
      nationality: "",
      occupation: "",
      dailyLifestyle: "",
      role: ""
    };

    const validatedFirstParent = firstParent ? {
      ...defaultParent,
      ...firstParent,
      age: typeof firstParent.age === 'string' ? parseInt(firstParent.age) || 0 : firstParent.age || 0
    } : defaultParent;

    const validatedSecondParent = secondParent ? {
      ...defaultParent,
      ...secondParent,
      age: typeof secondParent.age === 'string' ? parseInt(secondParent.age) || 0 : secondParent.age || 0
    } : defaultParent;

    const updateData = {
      isHostFamily: true,
      hostFamily: {
        isPairConnect,
        isPairHaven,
        isPaused,
        isPairConnectPaused,
        isPairHavenPaused,
        
        familyStructure,
        familyName,
        primaryLanguage,
        secondaryLanguage,
        availabilityDate,
        durationYear,
        durationMonth,
        religion,
        aboutYourFamily,
        spaceInHome,
        householdAtmosphere,
        profileImage,

        pets: Array.isArray(pets) ? pets : [],
        images,
        benefits: Array.isArray(benefits) ? benefits : [],
        dietaryPrefs: Array.isArray(dietaryPrefs) ? dietaryPrefs : [],

        noOfChildren,
        children: Array.isArray(parsedChildren) ? parsedChildren : [],

        schedule: parsedSchedule && typeof parsedSchedule === 'object' ? parsedSchedule : {},

        firstParent: validatedFirstParent,
        secondParent: validatedSecondParent,

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
        },

        requiredAuPairModel: requiredAuPairModel || {
          agencyName: "",
          country: "",
          abilityToDrive: "",
          experience: "",
          language: "",
          status: ""
        },
        optionalAuPairModel: optionalAuPairModel || {
          interest: "",
          language: "",
          pets: "",
          religion: "",
          temperament: ""
        }
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        select: '-password -otp -mobileOtp -__v'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Host family profile created successfully",
      data: {
        user: updatedUser.hostFamily.toObject()
      }
    });

  } catch (error) {
    console.error("Error creating host family profile:", error);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getAllHostFamily = async (req, res) => {
  try {
    const { type, userId, page = 1, length = 10, includeLiked = false } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type is required'
      });
    }

    let results = [];
    let matchConditions = {};

    if (type === 'pairConnect') {
      // Base match conditions for pairConnect
      matchConditions = {
        isHostFamily: true,
        'hostFamily.isPairConnect': true,
        'hostFamily.isPairConnectPaused': { $ne: true }
      };

      // Add likeProfile condition if includeLiked is specified
      if (includeLiked !== undefined) {
        matchConditions['hostFamily.likeProfile'] = includeLiked;
      }

      results = await User.aggregate([
        {
          $match: matchConditions
        },
        { $sample: { size: length * 5 } },
        { $skip: (page - 1) * length },
        { $limit: length }
      ]);
    }
    else if (type === 'pairHaven') {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required for pairHaven'
        });
      }

      // Base match conditions for pairHaven
      matchConditions = {
        _id: userId,
        isHostFamily: true,
        'hostFamily.isPairHaven': true,
        'hostFamily.isPairHavenPaused': { $ne: true }
      };

      // Add likeProfile condition if includeLiked is specified
      if (includeLiked !== undefined) {
        matchConditions['hostFamily.likeProfile'] = includeLiked;
      }

      const user = await User.findOne(matchConditions).lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Host family not found or not matching the criteria'
        });
      }

      results = [user];
    }
    else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type value'
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
      page,
      length,
      total: results.length
    });

  } catch (error) {
    console.error('Error in getAllHostFamily:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const pauseHostFamily = async (req, res) => {
  try {
    const { userId, type } = req.body;
    console.log("type", type);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!type || !['pairConnect', 'pairHaven'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "pairConnect" or "pairHaven"'
      });
    }

    const user = await User.findOne({
      _id: userId,
      isHostFamily: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Host family not found'
      });
    }

    const typeField = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (!user.hostFamily || user.hostFamily[typeField] !== true) {
      return res.status(400).json({
        success: false,
        message: `This host family is not registered as ${type}`
      });
    }

    const pauseField = `${typeField}Paused`;
    user.hostFamily[pauseField] = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Host family ${type} paused successfully`,
      data: {
        userId: user._id,
        type,
        [pauseField]: true
      }
    });

  } catch (error) {
    console.error('Error in pauseHostFamily:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const unpauseHostFamily = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!type || !['pairConnect', 'pairHaven'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "pairConnect" or "pairHaven"'
      });
    }

    const user = await User.findOne({
      _id: userId,
      isHostFamily: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Host family not found'
      });
    }

    const typeField = `is${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (!user.hostFamily || !user.hostFamily[typeField]) {
      return res.status(400).json({
        success: false,
        message: `This host family is not registered as ${type}`
      });
    }

    const pauseField = `${typeField}Paused`;
    user.hostFamily[pauseField] = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Host family ${type} unpaused successfully`,
      data: {
        userId: user._id,
        type,
        [pauseField]: false
      }
    });

  } catch (error) {
    console.error('Error in unpauseHostFamily:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const likeHostFamilyProfile = async (req, res) => {
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

        if (!user.isHostFamily || !user.hostFamily) {
            return res.status(400).json({
                success: false,
                message: "This user does not have a Host Family profile"
            });
        }

        user.hostFamily.likeProfile = status;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Host Family profile ${status ? 'liked' : 'unliked'} successfully`,
            data: {
                userId: user._id,
                likeProfile: user.hostFamily.likeProfile
            }
        });

    } catch (error) {
        console.error("Error in likeHostFamilyProfile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


module.exports = { likeHostFamilyProfile,createHostFamily, getAllHostFamily, pauseHostFamily, unpauseHostFamily };