const LikeUser = require("../../models/LikeUser.model");
const User = require("../../models/User.model");
const ConnectionUser = require("../../models/ConnectionUser.model");

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
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: likerId, likedUserId, mainCategory, subCategory",
      });
    }

    const likerUser = await User.findById(likerId);
    const likedUser = await User.findById(likedUserId);

    if (!likerUser || !likedUser) {
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

    let isLike = false;

    if (existingLike) {
      await LikeUser.findByIdAndDelete(existingLike._id);

      await updateLikeFlag(likerUser, mainCategory, subCategory, false);
      await likerUser.save();

      const mutualLike = await LikeUser.findOne({
        likerId: likedUserId,
        likedUserId: likerId,
        mainCategory,
        subCategory,
      });

      let response = {
        success: true,
        message: "Like removed successfully",
        data: {
          isLike: false,
          isMatch: false,
          mainCategory,
          subCategory,
        },
      };

      if (mutualLike) {
        const likerConnections = await ConnectionUser.findOne({
          userId: likerId,
        });

        if (likerConnections) {
          likerConnections.connections = likerConnections.connections.filter(
            (conn) => conn.user._id.toString() !== likedUserId.toString()
          );

          if (likerConnections.connections.length === 0) {
            await ConnectionUser.deleteOne({ userId: likerId });
          } else {
            await likerConnections.save();
          }
        }

        const likedConnections = await ConnectionUser.findOne({
          userId: likedUserId,
        });

        if (likedConnections) {
          likedConnections.connections = likedConnections.connections.filter(
            (conn) => conn.user._id.toString() !== likerId.toString()
          );
          if (likedConnections.connections.length === 0) {
            await ConnectionUser.deleteOne({ userId: likedUserId });
          } else {
            await likedConnections.save();
          }
        }

        const commonAttributes = findCommonAttributes(likerUser, likedUser);
        response.data.commonAttributes = commonAttributes;
      }

      return res.status(200).json(response);
    }
    const newLike = await LikeUser.findOneAndUpdate(
      { likerId, likedUserId, mainCategory, subCategory },
      {
        $setOnInsert: {
          likerId,
          likedUserId,
          mainCategory,
          subCategory,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    isLike = true;

    await updateLikeFlag(likerUser, mainCategory, subCategory, true);
    await likerUser.save();

    const mutualLike = await LikeUser.findOne({
      likerId: likedUserId,
      likedUserId: likerId,
      mainCategory,
      subCategory,
    });

    let response = {
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
      console.log("Mutual like found, creating connection");
      const commonAttributes = findCommonAttributes(likerUser, likedUser);

      await ConnectionUser.findOneAndUpdate(
        { userId: likerId, "connections.user._id": { $ne: likedUser._id } },
        {
          $push: {
            connections: { user: likedUser, commonalities: commonAttributes },
          },
        },
        { upsert: true, new: true }
      );

      await ConnectionUser.findOneAndUpdate(
        { userId: likedUserId, "connections.user._id": { $ne: likerUser._id } },
        {
          $push: {
            connections: { user: likerUser, commonalities: commonAttributes },
          },
        },
        { upsert: true, new: true }
      );

      response.data.commonAttributes = commonAttributes;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createLike function:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Like already exists for this category",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLikeFlag = (user, mainCategory, subCategory, value) => {
  const userSchema = mainCategory === "auPair" ? user.auPair : user.hostFamily;

  if (!userSchema) return;

  const flagName = subCategory + "Like";

  if (flagName in userSchema) {
    userSchema[flagName] = value;
  }
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
