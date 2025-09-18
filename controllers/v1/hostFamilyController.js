const mongoose = require("mongoose");
const User = require("../../models/User.model.js");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const ReportUser = require("../../models/ReportUser.model.js");
const LikeUser = require('../../models/LikeUser.model');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2'
});

const createHostFamily = async (req, res) => {
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
      profileImage = "",
      pets,
      images,
      benefits,
      dietaryPrefs,
      noOfChildren,
      children,
      schedule,
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
        message: "Valid userId is required",
      });
    }

    if (!isPairConnect && !isPairHaven) {
      return res.status(400).json({
        success: false,
        code: "NO_PROGRAM_SELECTED",
        message: "At least one program must be selected",
      });
    }

    if (isPairConnect && !isPairHaven && noOfChildren !== children?.length) {
      return res.status(400).json({
        success: false,
        message: "Number of children does not match children array length",
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
    if (typeof schedule === "string") {
      try {
        parsedSchedule = JSON.parse(schedule);
      } catch {
        parsedSchedule = {};
      }
    }

    let parsedChildren = children;
    if (typeof children === "string") {
      try {
        parsedChildren = JSON.parse(children);
      } catch {
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
      role: "",
    };

    const validatedFirstParent = firstParent
      ? {
        ...defaultParent,
        ...firstParent,
        age:
          typeof firstParent.age === "string"
            ? parseInt(firstParent.age) || 0
            : firstParent.age || 0,
      }
      : defaultParent;

    const validatedSecondParent = secondParent
      ? {
        ...defaultParent,
        ...secondParent,
        age:
          typeof secondParent.age === "string"
            ? parseInt(secondParent.age) || 0
            : secondParent.age || 0,
      }
      : defaultParent;

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

    const updatedHostFamily = {
      ...existingUser.hostFamily?.toObject(),
      isPairConnect: isPairConnect ?? existingUser.hostFamily?.isPairConnect,
      isPairHaven: isPairHaven ?? existingUser.hostFamily?.isPairHaven,
      isPaused: isPaused ?? existingUser.hostFamily?.isPaused,
      isPairConnectPaused:
        isPairConnectPaused ?? existingUser.hostFamily?.isPairConnectPaused,
      isPairHavenPaused:
        isPairHavenPaused ?? existingUser.hostFamily?.isPairHavenPaused,

      familyStructure: familyStructure ?? existingUser.hostFamily?.familyStructure,
      familyName: familyName ?? existingUser.hostFamily?.familyName,
      primaryLanguage: primaryLanguage ?? existingUser.hostFamily?.primaryLanguage,
      secondaryLanguage:
        secondaryLanguage ?? existingUser.hostFamily?.secondaryLanguage,
      availabilityDate: availabilityDate ?? existingUser.hostFamily?.availabilityDate,
      durationYear: durationYear ?? existingUser.hostFamily?.durationYear,
      durationMonth: durationMonth ?? existingUser.hostFamily?.durationMonth,
      religion: religion ?? existingUser.hostFamily?.religion,
      aboutYourFamily: aboutYourFamily ?? existingUser.hostFamily?.aboutYourFamily,
      spaceInHome: spaceInHome ?? existingUser.hostFamily?.spaceInHome,
      householdAtmosphere:
        householdAtmosphere ?? existingUser.hostFamily?.householdAtmosphere,
      profileImage: profileImage || existingUser.hostFamily?.profileImage,

      pets: pets ?? existingUser.hostFamily?.pets ?? [],
      images: images ?? existingUser.hostFamily?.images ?? [],
      benefits: benefits ?? existingUser.hostFamily?.benefits ?? [],
      dietaryPrefs: dietaryPrefs ?? existingUser.hostFamily?.dietaryPrefs ?? [],

      noOfChildren: noOfChildren ?? existingUser.hostFamily?.noOfChildren,
      children: parsedChildren ?? existingUser.hostFamily?.children ?? [],

      schedule: parsedSchedule ?? existingUser.hostFamily?.schedule ?? {},

      firstParent: validatedFirstParent ?? existingUser.hostFamily?.firstParent,
      secondParent: validatedSecondParent ?? existingUser.hostFamily?.secondParent,

      agency: agency ?? existingUser.hostFamily?.agency,
      location: location ?? existingUser.hostFamily?.location,
      requiredAuPairModel:
        requiredAuPairModel ?? existingUser.hostFamily?.requiredAuPairModel,
      optionalAuPairModel:
        optionalAuPairModel ?? existingUser.hostFamily?.optionalAuPairModel,
    };

    existingUser.isHostFamily = true;
    existingUser.hostFamily = updatedHostFamily;

    const savedUser = await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Host family profile updated successfully",
      data: { user: savedUser },
    });
  } catch (error) {
    console.error("Error creating/updating host family profile:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllHostFamily = async (req, res) => {
  try {
    const {
      type,
      userId,
      page = 1,
      length = 10,
      pairHeavenFilters = {},
      pairLinkFilters = {},
      pairConnectFilters = {},
      includeLiked = false
    } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type is required'
      });
    }

    let reportedIds = [];
    let likedIds = [];

    if (userId) {
      const reportedUsers = await ReportUser.find({ reporterId: userId }).select('reportedUserId');
      reportedIds = reportedUsers.map(report => report.reportedUserId);

      if (!includeLiked) {
        const likedUsers = await LikeUser.find({ userId: userId }).select('likedUserId');
        likedIds = likedUsers.map(like => like.likedUserId);
      }
    }

    let results = [];
    let matchConditions = {};
    let filters = {};

    if (type === 'pairConnect') {
      filters = pairConnectFilters;
      matchConditions = {
        isHostFamily: true,
        'hostFamily.isPairConnect': true,
        'hostFamily.isPairConnectPaused': { $ne: true },
        _id: { $nin: reportedIds }
      };

      if (!includeLiked && likedIds.length > 0) {
        matchConditions._id.$nin = [...matchConditions._id.$nin, ...likedIds];
      }

    } else if (type === 'pairHaven') {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required for pairHaven'
        });
      }
      filters = pairHeavenFilters;
      matchConditions = {
        _id: new mongoose.Types.ObjectId(userId),
        isHostFamily: true,
        'hostFamily.isPairHaven': true,
        'hostFamily.isPairHavenPaused': { $ne: true },
        _id: { $nin: reportedIds }
      };

      if (!includeLiked && likedIds.length > 0) {
        matchConditions._id.$nin = [...matchConditions._id.$nin, ...likedIds];
      }

    } else if (type === 'pairLink') {
      filters = pairLinkFilters;
      matchConditions = {
        isAuPair: true,
        'auPair.isPairLink': true,
        'auPair.isPairLinkPaused': { $ne: true },
        _id: {
          $nin: [...reportedIds]
        }
      };

      if (!includeLiked && likedIds.length > 0) {
        matchConditions._id.$nin = [...matchConditions._id.$nin, ...likedIds];
      }

      if (userId) {
        matchConditions._id.$nin = [...matchConditions._id.$nin, new mongoose.Types.ObjectId(userId)];
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type value'
      });
    }

    if (type === 'pairConnect') {
      const {
        numberOfChildren,
        ageOfChildren,
        location,
        howfar,
        availability,
        duration
      } = filters;

      if (numberOfChildren) {
        matchConditions['hostFamily.noOfChildren'] = numberOfChildren;
      }

      if (ageOfChildren && Array.isArray(ageOfChildren) && ageOfChildren.length > 0) {
        matchConditions['hostFamily.children.age'] = { $in: ageOfChildren };
      }

      if (location) {
        const locationRegex = new RegExp(location, 'i');
        matchConditions['$or'] = [
          { 'hostFamily.location.zipCode': locationRegex },
          { 'hostFamily.location.city': locationRegex },
          { 'hostFamily.location.state': locationRegex }
        ];
      }

      if (howfar) {
        matchConditions['hostFamily.location.distance'] = { $lte: howfar };
      }

      if (availability) {
        matchConditions['hostFamily.availabilityDate'] = availability;
      }

      if (duration) {
        const [minDuration, maxDuration] = duration.split('-').map(Number);
        matchConditions['hostFamily.durationMonth'] = {
          $gte: minDuration,
          $lte: maxDuration
        };
      }
    } else if (type === 'pairHaven') {
      const {
        availability
      } = filters;

      if (availability) {
        matchConditions['hostFamily.availabilityDate'] = availability;
      }
    } else if (type === 'pairLink') {
      const {
        languages,
        age,
        usingPairLinkFor,
        state
      } = filters;

      if (languages && Array.isArray(languages) && languages.length > 0) {
        matchConditions['auPair.languages'] = { $in: languages };
      }

      if (age && Array.isArray(age) && age.length === 2) {
        const [minAge, maxAge] = age;
        matchConditions['auPair.age'] = {
          $gte: minAge,
          $lte: maxAge
        };
      }

      if (usingPairLinkFor && Array.isArray(usingPairLinkFor) && usingPairLinkFor.length > 0) {
        matchConditions['auPair.usingPairLinkFor'] = { $in: usingPairLinkFor };
      }

      if (state) {
        const stateRegex = new RegExp(state, 'i');
        matchConditions['auPair.location.state'] = stateRegex;
      }
    }

    if (type === 'pairConnect') {
      results = await User.aggregate([
        {
          $match: matchConditions
        },
        { $sample: { size: length * 5 } },
        { $skip: (page - 1) * length },
        { $limit: parseInt(length) }
      ]);
    } else if (type === 'pairHaven' || type === 'pairLink') {
      results = await User.find(matchConditions)
        .skip((page - 1) * length)
        .limit(parseInt(length))
        .lean();
    }

    let totalCount = 0;
    if (type === 'pairConnect') {
      totalCount = await User.countDocuments(matchConditions);
    } else if (type === 'pairHaven' || type === 'pairLink') {
      totalCount = await User.countDocuments(matchConditions);
    }

    return res.status(200).json({
      success: true,
      data: results,
      page: parseInt(page),
      length: parseInt(length),
      total: totalCount,
      totalPages: Math.ceil(totalCount / length)
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


module.exports = { likeHostFamilyProfile, createHostFamily, getAllHostFamily, pauseHostFamily, unpauseHostFamily };