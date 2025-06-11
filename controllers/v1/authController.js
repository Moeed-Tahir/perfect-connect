const jwt = require('jsonwebtoken');
const hostFamily = require("../../models/hostFamily.model.js");
const { generateOTP, sendOTP } = require('../../services/otpService.js');

//SignUpTherapist===============================
// exports.signUpTherapist = async (req, res) => {
//     try {
//         const {
//             fullName,
//             email,
//             phone,
//             DateOfBirth,
//             gender,
//             city,
//             prefferedClientAgegroup,
//             diagnosisOptions,
//             travelTime,
//             therapyType,
//             bankingDetails,
//             AHPRANumber,
//             field,
//             SPAResgistrationNumber,
//             WWCCNumber,
//             ABNNumber,
//             digitalSignature,
//             chargesPerHour,
//             addressOne,
//             addressTwo,
//             policeCheck,
//             ndis
//         } = req.body;

//         const existingUser = await Therapist.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         const toBoolean = (value) => {
//             if (typeof value === 'boolean') return value;
//             if (typeof value === 'string') {
//                 return value.toLowerCase() === 'true' || value === '1';
//             }
//             return false; 
//         };

//         const newUser = new Therapist({
//             // profilePhoto: req.file ? req.file.path : req.body.profilePhoto || "",
//             profilePhoto: req.file ? req.file.filename : req.body.profilePhoto || "",
//             fullName,
//             email,
//             phone,
//             DateOfBirth,
//             gender,
//             addressOne: addressOne,
//             addressTwo:addressTwo,
//             Address1:
//             city,
//             prefferedClientAgegroup: prefferedClientAgegroup || [],
//             diagnosisOptions: diagnosisOptions || [],
//             travelTime,
//             therapyType: therapyType || [],
//             bankingDetails,
//             AHPRANumber,
//             field,
//             SPAResgistrationNumber,
//             WWCCNumber,
//             ABNNumber,
//             digitalSignature,
//             chargesPerHour,
//             policeCheck:policeCheck,
//             NDIS:toBoolean(ndis),
//             role: "therapist"
//         });



//         const savedClient = await newUser.save();

//         const token = jwt.sign(
//             { id: savedClient._id, email: savedClient.email, role: 'therapist' },
//             process.env.SECRET_KEY,
//             { expiresIn: '24h' }
//         );

//         const clientData = savedClient.toObject();

//         res.status(200).json({
//             message: "Account created successfully",
//             user: clientData,
//             token,
//             role: clientData.role
//         });

//     } catch (error) {
//         console.error("SignUpTherapist Error:", error);
//         res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// };

// //SignUpClient===============================
// exports.signUpClient = async (req, res) => {
//     try {                
//         const {
//             fullName,
//             email,
//             phone,
//             DateOfBirth,
//             gender,
//             city,
//             resedentialAddress,
//             therapyServices,
//             diagonosis,
//             preferTherapy,
//             assessmentAndRiskAssessment,
//             planEndDate,
//             fundingTherapySection,
//             fundingManagementType,
//             termAndCondition
//         } = req.body;

//         const toBoolean = (value) => {
//             if (typeof value === 'boolean') return value;
//             if (typeof value === 'string') {
//                 return value.toLowerCase() === 'true' || value === '1';
//             }
//             return false; 
//         };

//         const existingClient = await Client.findOne({ email });

//         if (existingClient) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Client with this email already exists'
//             });
//         }

//         const newClient = new Client({
//             profilePhoto: req.file ? req.file.path : "",
//             fullName,
//             email,
//             phone,
//             DateOfBirth: new Date(DateOfBirth),
//             gender,
//             city,
//             resedentialAddress: resedentialAddress ? resedentialAddress.split(',').map(item => item.trim()) : [],
//             therapyServices,
//             diagonosis,
//             preferTherapy,
//             assessmentAndRiskAssessment: toBoolean(assessmentAndRiskAssessment),
//             planEndDate,
//             fundingTherapySection,
//             fundingManagementType,
//             termAndCondition: toBoolean(termAndCondition),
//             role: "client"
//         });

//         const savedClient = await newClient.save();

//         const token = jwt.sign(
//             { id: savedClient._id, email: savedClient.email, role: 'client' },
//             process.env.SECRET_KEY,
//             { expiresIn: '24h' }
//         );

//         const clientData = savedClient.toObject();


//         return res.status(201).json({
//             success: true,
//             message: 'Client created successfully',
//             data: clientData,
//             token:token
//         });

//     } catch (error) {
//         console.error("Error in signUpClient:", error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

// //SignUpReferalRegister===============================
// exports.signUpReferalRegister = async (req, res) => {
//     try {
//         const {
//             fullName,
//             email,
//             phone,
//             DateOfBirth,
//             gender,
//             city,
//             resedentialAddress,
//             businessName,
//             businessAddress,
//             businessWebsiteAddress
//         } = req.body;

//         const existingUser = await ReferalRegister.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User with this email already exists'
//             });
//         }

//         const newUser = new ReferalRegister({
//             profilePhoto: req.file ? req.file.path : "",
//             fullName,
//             email,
//             phone,
//             DateOfBirth: new Date(DateOfBirth),
//             gender,
//             city,
//             resedentialAddress: resedentialAddress ? resedentialAddress.split(',').map(item => item.trim()) : [],
//             businessName,
//             businessAddress,
//             businessWebsiteAddress,
//             role: "referral"
//         });


//         const savedUser = await newUser.save();

//         const token = jwt.sign(
//             { id: savedUser._id, email: savedUser.email, role: 'referral' },
//             process.env.SECRET_KEY,
//             { expiresIn: '24h' }
//         );

//         const userData = savedUser.toObject();

//         res.status(201).json({
//             success: true,
//             message: 'Referral registered successfully',
//             data: userData,
//             role: userData.role,
//             token
//         });

//     } catch (error) {
//         console.error('Error in signUpReferalRegister:', error);

//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation error',
//                 errors: messages
//             });
//         }

//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email already exists'
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };

//Verify Email===============================
exports.verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user already exists in the DummyUser collection
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

// Verify OTP===============================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await hostFamily.findOne({ email, otp, isOtpVerified: false });

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

//Resend OTP===============================
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await hostFamily.findOne({ email });
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

        await sendOTP(email, otp);

        res.status(200).json({
            message: "New OTP sent to your email",
            success: true,
            email: email
        });

    } catch (error) {
        console.error("Error in resendOTP:", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};
