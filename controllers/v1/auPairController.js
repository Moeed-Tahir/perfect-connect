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
            usingPairLinkFor,

            // Lists
            images = [],
            languages = [],
            pets = [],
            expNskills = [],
            temperament = [],
            thingsILove = [],
            whatMakesMeSmile = [],
            favSpots = [],

            // Nested Models
            agency,
            location

        } = req.body;

        // Validate at least one type is selected
        if (!isPairConnect && !isPairHaven && !isPairLink) {
            return res.status(400).json({ message: "At least one au pair type must be selected" });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure user is marked as au pair
        user.isAuPair = true;

        // Create or update au pair profile
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
            usingPairLinkFor,

            // Lists
            images: Array.isArray(images) ? images : [],
            languages: Array.isArray(languages) ? languages : [],
            pets: Array.isArray(pets) ? pets : [],
            expNskills: Array.isArray(expNskills) ? expNskills : [],
            temperament: Array.isArray(temperament) ? temperament : [],
            thingsILove: Array.isArray(thingsILove) ? thingsILove : [],
            whatMakesMeSmile: Array.isArray(whatMakesMeSmile) ? whatMakesMeSmile : [],
            favSpots: Array.isArray(favSpots) ? favSpots : [],

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
                infoAboutArea: ""
            }
        };

        // Save the updated user
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

module.exports = {
    createAuPairProfile
};