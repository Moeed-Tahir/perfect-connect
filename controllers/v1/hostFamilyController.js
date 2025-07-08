// const HostFamily = require("../../models/User.model.js");
const User = require("../../models/User.model.js");

const createHostFamily = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            isPairConnect,
            isPairHaven,
            familyStructure,
            firstParent,
            secondParent,
            languages,
            agency,
            availability,
            numberOfChildren,
            children,
            schedule,
            religion,
            pets,
            location,
            benefits,
            householdAtmosphere,
            profilePhoto,
            galleryPhotos,
            pairConnectData,
            pairHavenData
        } = req.body;

        // Validate at least one program is selected
        if (!isPairConnect && !isPairHaven) {
            return res.status(400).json({
                success: false,
                code: "NO_PROGRAM_SELECTED",
                message: 'At least one program (PairConnect or PairHaven) must be selected'
            });
        }

        // Prepare the update object
        const updateData = {
            isHostFamily: true,
            hostFamily: {
                isPairConnect,
                isPairHaven,
                familyStructure,
                firstParent,
                secondParent,
                languages,
                agency,
                availability,
                numberOfChildren,
                children,
                schedule,
                religion,
                pets,
                location,
                benefits,
                householdAtmosphere,
                profilePhoto,
                galleryPhotos,
                ...(isPairConnect && { pairConnectData: pairConnectData || {} }),
                ...(isPairHaven && { pairHavenData: pairHavenData || {} })
            }
        };

        // Update user with host family data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        ).select('-password -otp -mobileOtp -__v');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: 'User not found'
            });
        }

        // Convert Mongoose document to plain object and remove internal fields
        const userResponse = updatedUser.toObject();
        delete userResponse.createdAt;
        delete userResponse.updatedAt;

        res.status(200).json({
            success: true,
            message: 'Host family profile created successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Error creating host family profile:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {});

            return res.status(400).json({
                success: false,
                code: "VALIDATION_ERROR",
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createHostFamily
}
