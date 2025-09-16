const LikeUser = require("../../models/LikeUser.model");
const User = require("../../models/User.model");
const ConnectionUser = require("../../models/ConnectionUser.model");
const mongoose = require("mongoose");

const findCommonAttributes = (likerUser, likedUser) => {
  const commonAttributes = {
    sharedPlatforms: [],
    sharedLanguages: [],
    sharedInterests: [],
    sharedTemperaments: [],
    locationCompatibility: {},
    scheduleCompatibility: false,
    ageCompatibility: false,
    petCompatibility: false,
    religionCompatibility: false,
  };

  if (likerUser.isHostFamily && likedUser.isAuPair) {
    const hostFamily = likerUser.hostFamily;
    const auPair = likedUser.auPair;

    // Platform compatibility
    if (hostFamily.isPairConnect && auPair.isPairConnect) {
      commonAttributes.sharedPlatforms.push("PairConnect");
    }
    if (hostFamily.isPairHaven && auPair.isPairHaven) {
      commonAttributes.sharedPlatforms.push("PairHaven");
    }
    if (auPair.isPairLink) {
      commonAttributes.sharedPlatforms.push("PairLink");
    }

    if (
      hostFamily.primaryLanguage &&
      auPair.languages &&
      auPair.languages.length > 0
    ) {
      const hostLanguages = [
        hostFamily.primaryLanguage,
        hostFamily.secondaryLanguage,
      ].filter((lang) => lang && lang !== "");

      commonAttributes.sharedLanguages = auPair.languages.filter((lang) =>
        hostLanguages.includes(lang)
      );
    }

    if (
      hostFamily.children &&
      hostFamily.children.length > 0 &&
      auPair.thingsILove &&
      auPair.thingsILove.length > 0
    ) {
      const childInterests = hostFamily.children.flatMap(
        (child) => child.interests || []
      );
      commonAttributes.sharedInterests = auPair.thingsILove.filter((interest) =>
        childInterests.includes(interest)
      );
    }

    // Temperament compatibility
    if (
      hostFamily.children &&
      hostFamily.children.length > 0 &&
      auPair.temperament &&
      auPair.temperament.length > 0
    ) {
      const childTemperaments = hostFamily.children.flatMap(
        (child) => child.temperaments || []
      );
      commonAttributes.sharedTemperaments = auPair.temperament.filter((temp) =>
        childTemperaments.includes(temp)
      );
    }

    // Location compatibility
    if (hostFamily.location && auPair.location) {
      commonAttributes.locationCompatibility = {
        sameCountry: hostFamily.location.country === auPair.location.country,
        sameState: hostFamily.location.state === auPair.location.state,
        sameCity: hostFamily.location.city === auPair.location.city,
      };
    }

    // Age compatibility
    if (hostFamily.children && hostFamily.children.length > 0 && auPair.age) {
      const childAges = hostFamily.children.map((child) => child.age);
      const avgChildAge =
        childAges.reduce((sum, age) => sum + age, 0) / childAges.length;
      commonAttributes.ageCompatibility =
        Math.abs(auPair.age - avgChildAge) <= 15;
    }

    // Pet compatibility
    if (
      hostFamily.pets &&
      hostFamily.pets.length > 0 &&
      auPair.pets &&
      auPair.pets.length > 0
    ) {
      commonAttributes.petCompatibility = hostFamily.pets.some((pet) =>
        auPair.pets.includes(pet)
      );
    }

    // Religion compatibility
    if (hostFamily.religion && auPair.religion) {
      commonAttributes.religionCompatibility =
        hostFamily.religion === auPair.religion;
    }

    // Schedule compatibility
    if (hostFamily.schedule && auPair.availabilityDate) {
      commonAttributes.scheduleCompatibility = true;
    }
  } else if (likerUser.isAuPair && likedUser.isHostFamily) {
    const auPair = likerUser.auPair;
    const hostFamily = likedUser.hostFamily;

    // Platform compatibility
    if (auPair.isPairConnect && hostFamily.isPairConnect) {
      commonAttributes.sharedPlatforms.push("PairConnect");
    }
    if (auPair.isPairHaven && hostFamily.isPairHaven) {
      commonAttributes.sharedPlatforms.push("PairHaven");
    }
    if (auPair.isPairLink) {
      commonAttributes.sharedPlatforms.push("PairLink");
    }

    // Language compatibility - FIXED
    if (
      hostFamily.primaryLanguage &&
      auPair.languages &&
      auPair.languages.length > 0
    ) {
      const hostLanguages = [
        hostFamily.primaryLanguage,
        hostFamily.secondaryLanguage,
      ].filter((lang) => lang && lang !== "");

      commonAttributes.sharedLanguages = auPair.languages.filter((lang) =>
        hostLanguages.includes(lang)
      );
    }

    // Interests compatibility
    if (
      hostFamily.children &&
      hostFamily.children.length > 0 &&
      auPair.thingsILove &&
      auPair.thingsILove.length > 0
    ) {
      const childInterests = hostFamily.children.flatMap(
        (child) => child.interests || []
      );
      commonAttributes.sharedInterests = auPair.thingsILove.filter((interest) =>
        childInterests.includes(interest)
      );
    }

    // Temperament compatibility
    if (
      hostFamily.children &&
      hostFamily.children.length > 0 &&
      auPair.temperament &&
      auPair.temperament.length > 0
    ) {
      const childTemperaments = hostFamily.children.flatMap(
        (child) => child.temperaments || []
      );
      commonAttributes.sharedTemperaments = auPair.temperament.filter((temp) =>
        childTemperaments.includes(temp)
      );
    }

    // Location compatibility
    if (hostFamily.location && auPair.location) {
      commonAttributes.locationCompatibility = {
        sameCountry: hostFamily.location.country === auPair.location.country,
        sameState: hostFamily.location.state === auPair.location.state,
        sameCity: hostFamily.location.city === auPair.location.city,
      };
    }

    // Age compatibility
    if (hostFamily.children && hostFamily.children.length > 0 && auPair.age) {
      const childAges = hostFamily.children.map((child) => child.age);
      const avgChildAge =
        childAges.reduce((sum, age) => sum + age, 0) / childAges.length;
      commonAttributes.ageCompatibility =
        Math.abs(auPair.age - avgChildAge) <= 15;
    }

    // Pet compatibility
    if (
      hostFamily.pets &&
      hostFamily.pets.length > 0 &&
      auPair.pets &&
      auPair.pets.length > 0
    ) {
      commonAttributes.petCompatibility = hostFamily.pets.some((pet) =>
        auPair.pets.includes(pet)
      );
    }

    // Religion compatibility
    if (hostFamily.religion && auPair.religion) {
      commonAttributes.religionCompatibility =
        hostFamily.religion === auPair.religion;
    }

    // Schedule compatibility
    if (hostFamily.schedule && auPair.availabilityDate) {
      commonAttributes.scheduleCompatibility = true;
    }
  }

  // Calculate match percentage
  const totalChecks = 9;
  let matchScore = 0;

  if (commonAttributes.sharedPlatforms.length > 0) matchScore++;
  if (commonAttributes.sharedLanguages.length > 0) matchScore++;
  if (commonAttributes.sharedInterests.length > 0) matchScore++;
  if (commonAttributes.sharedTemperaments.length > 0) matchScore++;
  if (commonAttributes.locationCompatibility.sameCountry) matchScore++;
  if (commonAttributes.ageCompatibility) matchScore++;
  if (commonAttributes.petCompatibility) matchScore++;
  if (commonAttributes.religionCompatibility) matchScore++;
  if (commonAttributes.scheduleCompatibility) matchScore++;

  commonAttributes.matchPercentage = Math.round(
    (matchScore / totalChecks) * 100
  );

  return commonAttributes;
};

const createLike = async (req, res) => {
  try {
    const { likerId, likedUserId, mainCategory, subCategory } = req.body;

    if (!likerId || !likedUserId || !mainCategory || !subCategory) {
      console.log('Missing required fields:', { likerId, likedUserId, mainCategory, subCategory });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: likerId, likedUserId, mainCategory, subCategory",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(likerId) ||
      !mongoose.Types.ObjectId.isValid(likedUserId)
    ) {
      console.log('Invalid ObjectId format:', { likerId, likedUserId });
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const [likerUser, likedUser] = await Promise.all([
      User.findById(likerId),
      User.findById(likedUserId),
    ]);

    if (!likerUser || !likedUser) {
      console.log('User not found:', { likerId, likedUserId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingLike = await LikeUser.findOne({
      likerId,
      likedUserId,
      mainCategory,
      subCategory,
    });

    let response;

    if (existingLike) {
      await LikeUser.findByIdAndDelete(existingLike._id);

      updateLikeFlag(likedUser, mainCategory, subCategory, false);
      await likedUser.save();
      await likerUser.save();

      const mutualLike = await LikeUser.findOne({
        likerId: likedUserId,
        likedUserId: likerId,
      });

      if (mutualLike) {
        await removeConnection(likerId, likedUserId);
      }

      response = {
        success: true,
        message: "Like removed successfully",
        data: {
          isLike: false,
          isMatch: false,
          mainCategory,
          subCategory,
        },
      };
    } else {
      const newLike = new LikeUser({
        likerId,
        likedUserId,
        mainCategory,
        subCategory,
      });
      await newLike.save();

      updateLikeFlag(likedUser, mainCategory, subCategory, true);
      await likedUser.save();
      await likerUser.save();

      const mutualLike = await LikeUser.findOne({
        likerId: likedUserId,
        likedUserId: likerId,
      });

      response = {
        success: true,
        message: "Like created successfully",
        data: {
          like: newLike,
          isLike: true,
          isMatch: Boolean(mutualLike),
          mainCategory,
          subCategory,
        },
      };

      if (mutualLike) {
        const commonAttributes = findCommonAttributes(likerUser, likedUser);
        await createSingleConnection(likerId, likedUserId, commonAttributes);
        response.data.commonAttributes = commonAttributes;
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in createLike function:", error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createSingleConnection = async (userId1, userId2, commonAttributes) => {
  try {
    // Fetch both users in parallel
    const [user1, user2] = await Promise.all([
      User.findById(userId1),
      User.findById(userId2)
    ]);

    if (!user1 || !user2) {
      throw new Error("One or both users not found");
    }

    // Ensure consistent ordering of user IDs
    const sortedUserIds = [userId1.toString(), userId2.toString()].sort();

    // Convert user docs to plain objects
    const user1Obj = user1.toObject ? user1.toObject() : user1;
    const user2Obj = user2.toObject ? user2.toObject() : user2;
    const userObjects = [user1Obj, user2Obj];

    // Check if connection already exists
    const existingConnection = await ConnectionUser.findOne({
      users: { $all: sortedUserIds, $size: 2 }
    });

    let connection;

    if (existingConnection) {
      // Update existing connection
      connection = await ConnectionUser.findByIdAndUpdate(
        existingConnection._id,
        {
          commonalities: commonAttributes || { message: "No commonalities found" },
          userObjects
        },
        { new: true }
      );
      console.log('✅ Existing connection updated:', connection._id);
    } else {
      // Create new connection
      connection = await ConnectionUser.create({
        users: sortedUserIds,
        userObjects,
        commonalities: commonAttributes || { message: "No commonalities found" }
      });
      console.log('✅ New connection created:', connection._id);
    }

    return connection;
  } catch (error) {
    console.error("❌ Error creating single connection:", error.message);
    throw error;
  }
};

const removeConnection = async (userId1, userId2) => {
  try {
    const sortedUserIds = [userId1.toString(), userId2.toString()].sort();

    const result = await ConnectionUser.findOneAndDelete({
      users: { $all: sortedUserIds, $size: 2 }
    });

    if (!result) {
      console.log('⚠️ No connection found to remove');
      return null;
    }

    console.log('🗑️ Connection removed between users:', sortedUserIds);
    return result;
  } catch (error) {
    console.error("❌ Error removing connection:", error.message);
    throw error;
  }
};

const updateLikeFlag = (user, mainCategory, subCategory, value) => {

  if (mainCategory === "auPair") {

    if (!user.auPair) {
      console.log("No auPair object found in user");
      return;
    }

    if (subCategory === "isPairConnect") {
      user.auPair.isPairConnectLike = value;
    } else if (subCategory === "isPairHaven") {
      user.auPair.isPairHavenLike = value;
    } else if (subCategory === "isPairLink") {
      user.auPair.isPairLinkLike = value;
    } else {
      console.log("Unknown subCategory for auPair:", subCategory);
    }
  }

  else if (mainCategory === "hostFamily") {

    if (!user.hostFamily) {
      return;
    }

    if (subCategory === "isPairConnect") {
      user.hostFamily.isPairConnectLike = value;
    } else if (subCategory === "isPairHaven") {
      user.hostFamily.isPairHavenLike = value;
    } else {
      console.log("Unknown subCategory for hostFamily:", subCategory);
    }
  }

  // No matching case
  else {
    console.log("No matching case for:", { isAuPair: user.isAuPair, isHostFamily: user.isHostFamily, mainCategory });
  }

  console.log("Updated user object:", user);
};


const getLikesByReporter = async (req, res) => {
  try {
    const { likerId } = req.body;

    const likes = await LikeUser.find({ likerId })
      .populate("likedUserId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: likes.length,
      data: likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createLike, getLikesByReporter };
