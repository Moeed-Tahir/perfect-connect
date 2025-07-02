const jwt = require('jsonwebtoken');
const HostFamily = require("../../models/hostFamilyUser.model.js");
const { generateOTP, sendOTP } = require('../../services/otpService.js');

const loginHostFamily = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const userDoc = await HostFamily.findOne({ "user.email": email });
        if (!userDoc) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        userDoc.user.otp = otp;
        userDoc.user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        userDoc.user.isOtpVerified = false;
        await userDoc.save();

        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email", requiresOtp: true, email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const signUpHostFamilyWithEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const otp = generateOTP();
        let userDoc = await HostFamily.findOne({ "user.email": email });

        const defaultPairConnectData = {
            myProfileInformation: {
                firstName: "",
                lastName: "",
                age: null,
                nationality: ""
            },
            agency: {
                agencyName: "",
                agencyNumber: "",
                currentStatus: "",
                wouldChangeAgency: false,
                preferredAgency: ""
            },
            language: {
                primaryLanguage: "",
                secondaryLanguage: ""
            },
            availability: {
                availableFrom: null,
                durationYears: null,
                durationMonths: null
            },
            location: {
                zipCode: "",
                state: "",
                city: "",
                aboutArea: ""
            },
            experienceAndSkills: {
                skills: []
            },
            temperament: {
                tags: []
            },
            religion: {
                faith: ""
            },
            pets: {
                hasPets: false,
                petTypes: []
            },
            familyPhotos: {
                mainPhoto: "",
                galleryPhotos: []
            }
        };


        const defaultPairHeavenData = {
            familyProfile: "",
            firstParents: {
                firstName: "",
                lastName: "",
                showInPublicity: false,
                age: null,
                nationality: "",
                occupation: "",
                dailyLifestyle: ""
            },
            secondParents: {
                firstName: "",
                lastName: "",
                showInPublicity: false,
                age: null,
                nationality: "",
                occupation: "",
                dailyLifestyle: ""
            },
            languages: {
                primaryLanguage: "",
                secondaryLanguage: ""
            },
            agency: {
                agencyName: "",
                agencyNumber: "",
                currentStatus: "",
                wouldChangeAgency: false,
                preferredAgency: ""
            },
            availability: {
                availableFrom: null,
                durationYears: null,
                durationMonths: null
            },
            numberOfChildren: 0,
            children: [],
            schedule: {
                monday: { activities: [] },
                tuesday: { activities: [] },
                wednesday: { activities: [] },
                thursday: { activities: [] },
                friday: { activities: [] },
                saturday: { activities: [] },
                sunday: { activities: [] }
            },
            dietaryPreferences: {
                preferences: []
            },
            religion: {
                faith: ""
            },
            pets: {
                hasPets: false,
                petTypes: []
            },
            location: {
                zipCode: "",
                state: "",
                city: "",
                aboutArea: ""
            },
            benefits: {
                benefits: []
            },
            householdAtmosphere: {
                atmosphereType: "",
                description: ""
            },
            familyPhotos: {
                mainPhoto: "",
                galleryPhotos: []
            }
        };


        if (userDoc) {
            userDoc.user.otp = otp;
            userDoc.user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            userDoc.user.isOtpVerified = false;
        } else {
            userDoc = new HostFamily({
                user: {
                    email,
                    otp,
                    otpExpires: new Date(Date.now() + 5 * 60 * 1000),
                    isOtpVerified: false,
                    pairConnectEnabled: false,
                    pairConnectData: defaultPairConnectData,
                    pairHeavenEnabled: false,
                    pairHeavenData: defaultPairHeavenData
                }
            });
        }

        await userDoc.save();
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email", requiresOtp: true, email, otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const signUpHostFamilyWithPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: "Phone number is required" });

        const otp = generateOTP();
        let userDoc = await HostFamily.findOne({ "user.phone": phone });

        const defaultPairConnectData = {
            myProfileInformation: {
                firstName: "",
                lastName: "",
                age: null,
                nationality: ""
            },
            agency: {
                agencyName: "",
                agencyNumber: "",
                currentStatus: "",
                wouldChangeAgency: false,
                preferredAgency: ""
            },
            language: {
                primaryLanguage: "",
                secondaryLanguage: ""
            },
            availability: {
                availableFrom: null,
                durationYears: null,
                durationMonths: null
            },
            location: {
                zipCode: "",
                state: "",
                city: "",
                aboutArea: ""
            },
            experienceAndSkills: {
                skills: []
            },
            temperament: {
                tags: []
            },
            religion: {
                faith: ""
            },
            pets: {
                hasPets: false,
                petTypes: []
            },
            familyPhotos: {
                mainPhoto: "",
                galleryPhotos: []
            }
        };


        const defaultPairHeavenData = {
            familyProfile: "",
            firstParents: {
                firstName: "",
                lastName: "",
                showInPublicity: false,
                age: null,
                nationality: "",
                occupation: "",
                dailyLifestyle: ""
            },
            secondParents: {
                firstName: "",
                lastName: "",
                showInPublicity: false,
                age: null,
                nationality: "",
                occupation: "",
                dailyLifestyle: ""
            },
            languages: {
                primaryLanguage: "",
                secondaryLanguage: ""
            },
            agency: {
                agencyName: "",
                agencyNumber: "",
                currentStatus: "",
                wouldChangeAgency: false,
                preferredAgency: ""
            },
            availability: {
                availableFrom: null,
                durationYears: null,
                durationMonths: null
            },
            numberOfChildren: 0,
            children: [],
            schedule: {
                monday: { activities: [] },
                tuesday: { activities: [] },
                wednesday: { activities: [] },
                thursday: { activities: [] },
                friday: { activities: [] },
                saturday: { activities: [] },
                sunday: { activities: [] }
            },
            dietaryPreferences: {
                preferences: []
            },
            religion: {
                faith: ""
            },
            pets: {
                hasPets: false,
                petTypes: []
            },
            location: {
                zipCode: "",
                state: "",
                city: "",
                aboutArea: ""
            },
            benefits: {
                benefits: []
            },
            householdAtmosphere: {
                atmosphereType: "",
                description: ""
            },
            familyPhotos: {
                mainPhoto: "",
                galleryPhotos: []
            }
        };


        if (userDoc) {
            userDoc.user.otp = otp;
            userDoc.user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            userDoc.user.isOtpVerified = false;
        } else {
            userDoc = new HostFamily({
                user: {
                    phone,
                    otp,
                    otpExpires: new Date(Date.now() + 5 * 60 * 1000),
                    isOtpVerified: false,
                    pairConnectEnabled: false,
                    pairConnectData: defaultPairConnectData,
                    pairHeavenEnabled: false,
                    pairHeavenData: defaultPairHeavenData
                }
            });
        }

        await userDoc.save();

        res.status(200).json({ message: "OTP generated for phone verification", requiresOtp: true, phone, otp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const toggleHostFamilyCategory = async (req, res) => {
    try {
        const { userId, pairConnect = false, pairHeaven = false } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const hostFamily = await HostFamily.findById(userId);
        if (!hostFamily) {
            return res.status(404).json({ message: "Host family not found" });
        }

        hostFamily.user.pairConnectEnabled = pairConnect;
        hostFamily.user.pairHeavenEnabled = pairHeaven;

        await hostFamily.save();

        return res.status(200).json({
            message: "Categories updated successfully",
            data: {
                pairConnectEnabled: hostFamily.user.pairConnectEnabled,
                pairHeavenEnabled: hostFamily.user.pairHeavenEnabled
            }
        });

    } catch (error) {
        console.error("Error toggling host family category:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const otp = generateOTP();
        let userDoc = await HostFamily.findOne({ "user.email": email });

        if (userDoc) {
            userDoc.user.otp = otp;
            userDoc.user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        } else {
            userDoc = new HostFamily({
                user: {
                    email,
                    otp,
                    otpExpires: new Date(Date.now() + 5 * 60 * 1000)
                }
            });
        }

        await userDoc.save();
        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email", requiresOtp: true, email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        let userDoc;
        if (email) {
            userDoc = await HostFamily.findOne({ "user.email": email });
        } else if (phone) {
            userDoc = await HostFamily.findOne({ "user.phone": phone });
        } else {
            return res.status(400).json({ message: "Email or phone is required" });
        }

        if (!userDoc || userDoc.user.otp !== otp || userDoc.user.isOtpVerified) {
            return res.status(400).json({ message: "Invalid or expired OTP", requiresResend: true });
        }

        if (userDoc.user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired", requiresResend: true });
        }

        const token = jwt.sign({ userId: userDoc._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        userDoc.user.isOtpVerified = true;
        await userDoc.save();

        const userData = {
            id: userDoc._id,
            email: userDoc.user.email,
            phone: userDoc.user.phone
        };

        res.status(200).json({ message: "OTP verified successfully", user: userData, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        let userDoc;
        if (email) {
            userDoc = await HostFamily.findOne({ "user.email": email });
        } else if (phone) {
            userDoc = await HostFamily.findOne({ "user.phone": phone });
        } else {
            return res.status(400).json({ message: "Email or phone is required" });
        }

        if (!userDoc) {
            return res.status(404).json({ message: "User not found", requiresResend: false });
        }

        const otp = generateOTP();
        userDoc.user.otp = otp;
        userDoc.user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        userDoc.user.isOtpVerified = false;
        await userDoc.save();

        if (email) {
            await sendOTP(email, otp);
            res.status(200).json({ message: "New OTP sent to your email", success: true, email });
        } else {
            res.status(200).json({ message: "New OTP generated for phone verification", success: true, phone, otp });
        }
    } catch (error) {
        console.error("Error in resendOTP:", error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
};


module.exports = {
    loginHostFamily,
    signUpHostFamilyWithEmail,
    signUpHostFamilyWithPhone,
    verifyEmail,
    verifyOTP,
    resendOTP,
    toggleHostFamilyCategory
};