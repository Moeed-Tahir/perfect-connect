const User = require("../../models/User.model.js");

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

    let query = { isAuPair: true };

    if (type === 'pairConnect') {
      query['auPair.isPairConnect'] = true;
    } else if (type === 'pairHaven') {
      query['auPair.isPairHaven'] = true;
    } else if (type === 'pairLink') {
      query['auPair.isPairLink'] = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type value' });
    }

    const results = await User.find(query)
      .skip((page - 1) * length)
      .limit(length);

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Error in getAllAuPair:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
    createAuPairProfile,
    getAllAuPair
};