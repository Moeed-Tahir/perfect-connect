const jwt = require('jsonwebtoken');
const hostFamily = require("../../models/hostFamily.model.js");
const { generateOTP, sendOTP } = require('../../services/otpService.js');

const loginHostFamily = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await hostFamily.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.isOtpVerified = false;
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({
            message: "OTP sent to your email",
            requiresOtp: true,
            email: email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const signUpHostFamilyWithEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await hostFamily.findOne({ email });
        const otp = generateOTP();

        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            existingUser.isOtpVerified = false;
            await existingUser.save();
        } else {
            const newUser = new hostFamily({ email, otp });
            newUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            await newUser.save();
        }

        await sendOTP(email, otp);

        res.status(200).json({
            message: "OTP sent to your email",
            requiresOtp: true,
            email: email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const signUpHostFamilyWithPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const existingUser = await hostFamily.findOne({ phone });
        const otp = generateOTP();

        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            existingUser.isOtpVerified = false;
            await existingUser.save();
        } else {
            const newUser = new hostFamily({ phone, otp });
            newUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
            await newUser.save();
        }

        // For phone, we'll return the OTP in the response instead of sending it
        res.status(200).json({
            message: "OTP generated for phone verification",
            requiresOtp: true,
            phone: phone,
            otp: otp // Sending OTP directly in response for phone verification
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await hostFamily.findOne({ email });
        const otp = generateOTP();
        console.log("otp", otp);

        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            await existingUser.save();
        }
        else {
            const newUser = new hostFamily({ email });
            newUser.otp = otp;
            newUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            await newUser.save();
        }

        await sendOTP(email, otp);

        res.status(200).json({
            message: "OTP sent to your email",
            requiresOtp: true,
            email: email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp, phone } = req.body;

        let user;
        if (email) {
            user = await hostFamily.findOne({ email, otp, isOtpVerified: false });
        } else if (phone) {
            user = await hostFamily.findOne({ phone, otp, isOtpVerified: false });
        } else {
            return res.status(400).json({ message: "Email or phone is required" });
        }

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                requiresResend: true
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                requiresResend: true
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP has expired",
                requiresResend: true
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        user.isOtpVerified = true;
        await user.save();

        const userData = {
            id: user._id,
            email: user.email,
            phone: user.phone
        }

        res.status(200).json({
            message: "OTP verified successfully",
            user: userData,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        let user;
        if (email) {
            user = await hostFamily.findOne({ email });
        } else if (phone) {
            user = await hostFamily.findOne({ phone });
        } else {
            return res.status(400).json({ message: "Email or phone is required" });
        }

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                requiresResend: false
            });
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.isOtpVerified = false;
        await user.save();

        if (email) {
            await sendOTP(email, otp);
            res.status(200).json({
                message: "New OTP sent to your email",
                success: true,
                email: email
            });
        } else {
            res.status(200).json({
                message: "New OTP generated for phone verification",
                success: true,
                phone: phone,
                otp: otp
            });
        }

    } catch (error) {
        console.error("Error in resendOTP:", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

module.exports = {
    loginHostFamily,
    signUpHostFamilyWithEmail,
    signUpHostFamilyWithPhone,
    verifyEmail,
    verifyOTP,
    resendOTP
};