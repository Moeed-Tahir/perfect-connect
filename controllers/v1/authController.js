const jwt = require('jsonwebtoken');
const User = require("../../models/User.model.js");
const { generateOTP, sendOTP, sendOTPViaMessage } = require('../../services/otpService.js');
const { generateAuthToken } = require('../../services/authToken.js');


const signUpWithEmail = async (req, res) => {
    try {
        const { email, isHostFamily, isAuPair } = req.body;

        // Validate email presence
        if (!email || !isHostFamily || !isAuPair) {
            return res.status(400).json({
                success: false,
                message: "Email, isHostFamily, or isAuPair are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in."
            });
        }

        // Generate OTP and expiration (5 minutes from now)
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Create new user with only essential fields
        const newUser = new User({
            email,
            isHostFamily,
            isAuPair,
            otp,
            otpExpires,
            isOtpVerified: false,
            isMobileVerified: false
        });

        // Save user
        await newUser.save();

        // Send OTP email (in production, you would actually send it)
        await sendOTP(email, otp);

        // Respond with success (don't send OTP in response in production)
        res.status(200).json({
            success: true,
            message: "OTP sent to your email",
            data: {
                email,
                requiresOtp: true,
                isHostFamily: newUser.isHostFamily,
                isAuPair: newUser.isAuPair,
                // Don't include OTP in production response
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                code: "MISSING_FIELDS",
                message: "Email and OTP are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found"
            });
        }

        // Check OTP validity
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                code: "INVALID_OTP",
                message: "Invalid OTP",
                requiresResend: true
            });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                code: "EXPIRED_OTP",
                message: "OTP has expired",
                requiresResend: true
            });
        }

        // Update verification status
        user.isOtpVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        // For new signups, set default values if needed
        if (!user.isHostFamily && !user.isAuPair) {
            user.isHostFamily = false;
            user.isAuPair = false;
        }

        await user.save();

        // Generate token
        const token = generateAuthToken(user._id);

        // Prepare user data response
        const userData = {
            id: user._id,
            email: user.email,
            contactNo: user.contactNo,
            isMobileVerified: user.isMobileVerified,
            isOtpVerified: user.isOtpVerified,
            isHostFamily: user.isHostFamily,
            isAuPair: user.isAuPair,
            hostFamily: user.hostFamily || null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Return success response with complete user data
        res.status(200).json({
            success: true,
            message: user.isOtpVerified ? "Login successful" : "Email verified successfully",
            data: {
                token,
                user: userData,
                isNewUser: !user.isOtpVerified // Flag to indicate if this was initial verification
            }
        });

    } catch (error) {
        console.error("Email OTP verification error:", error);
        res.status(500).json({
            success: false,
            code: "SERVER_ERROR",
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


const resendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already verified
        if (user.isOtpVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        await user.save();

        // Send OTP (in production, implement actual sending)
        await sendOTP(email, otp);

        res.status(200).json({
            success: true,
            message: "New OTP sent to your email",
            data: { email }
        });

    } catch (error) {
        console.error("Resend email OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const initiateMobileVerification = async (req, res) => {
    try {
        const { phone, userId } = req.body;
        if (!phone || !userId) {
            return res.status(400).json({ message: "Phone number and user ID are required" });
        }

        // Find user by ID
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = generateOTP();
        user.contactNo = phone;
        user.mobileOtp = otp;
        user.mobileOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        user.isMobileVerified = false;
        await user.save();

        // Send OTP via SMS
        // await sendOTPViaMessage(phone, otp);
        res.status(200).json({
            message: "OTP sent to your phone",
            token: generateAuthToken(user._id), // Generate token for the user
            user: {
                id: user._id,
                phone: user.contactNo,
                requiresOtp: true,
                otp: otp // Don't send OTP in production response

            }
        });
    } catch (error) {
        console.error("Error initiating mobile verification:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

const verifyMobileOTP = async (req, res) => {
    try {
        const { phone, otp, userId } = req.body;

        // Validate input
        if (!phone || !otp || !userId) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        // Find user by phone
        const user = await User.findOne({ _id: userId, contactNo: phone });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if already verified
        if (user.isMobileVerified) {
            return res.status(400).json({ message: "Phone number is already verified" });
        }
        // Check OTP validity
        if (user.mobileOtp !== otp || user.mobileOtpExpires < new Date()) {

            return res.status(400).json({ message: "Invalid or expired OTP", requiresResend: true });
        }
        // Update user and generate token
        user.isMobileVerified = true;
        user.mobileOtp = undefined; // Clear OTP after verification
        user.mobileOtpExpires = undefined;
        await user.save();
        const token = generateAuthToken(user._id);
        // Return success response
        res.status(200).json({
            message: "Mobile number verified successfully",
            user: {
                id: user._id,
                phone: user.contactNo,
                isMobileVerified: user.isMobileVerified
            },
            token
        });

    } catch (error) {
        console.error("Mobile OTP verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const loginWithEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email presence
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // genrate OTP for login
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        user.isOtpVerified = false; // Reset OTP verification status
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email for login",
            data: {
                email,
                requiresOtp: true,
                userId: user._id
            }
        });


    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    signUpWithEmail,
    verifyEmailOTP,
    resendEmailOTP,
    initiateMobileVerification,
    verifyMobileOTP,
    loginWithEmail
};