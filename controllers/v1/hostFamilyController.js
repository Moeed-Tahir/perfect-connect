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
    const {
      userId,
      isPairConnect,
      isPairHaven,
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

    if (req.files && req.files.profileImage) {
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

    if (req.files && req.files.images) {
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

    const updateData = {
      isHostFamily: true,
      hostFamily: {
        isPairConnect,
        isPairHaven,
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
        pets,
        images,
        benefits,
        dietaryPrefs,
        noOfChildren,
        children,
        schedule,
        firstParent: firstParent || {
          age: 0,
          firstName: "",
          lastName: "",
          nationality: "",
          occupation: "",
          dailyLifestyle: "",
          role: ""
        },
        secondParent: secondParent || {
          age: 0,
          firstName: "",
          lastName: "",
          nationality: "",
          occupation: "",
          dailyLifestyle: "",
          role: ""
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
        user: updatedUser
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
    const { type, userId, page = 1, length = 10 } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type is required'
      });
    }

    let results = [];

    if (type === 'pairConnect') {
      results = await User.aggregate([
        { 
          $match: { 
            isHostFamily: true,
            'hostFamily.isPairConnect': true 
          } 
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

      const user = await User.findOne({
        _id: userId,
        isHostFamily: true,
        'hostFamily.isPairHaven': true
      }).lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Host family not found or not marked as pairHaven'
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
      length
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

module.exports = { createHostFamily, getAllHostFamily,pauseHostFamily,unpauseHostFamily };