const mongoose = require("mongoose");
const User = require("../../models/User.model.js");

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
      results = await User.find({
        isHostFamily: true,
        'hostFamily.isPairConnect': true
      })
        .skip((page - 1) * length)
        .limit(length)
        .lean();
    } else if (type === 'pairHaven') {
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
    } else {
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



module.exports = { createHostFamily, getAllHostFamily };