const express = require('express');
const authController = require('../../controllers/v1/authController');
const router = express.Router();
router.post("/signUpHostFamilyWithPhone", authController.signUpHostFamilyWithPhone);
router.post("/signUpHostFamilyWithEmail", authController.signUpHostFamilyWithEmail);
router.post("/loginHostFamily", authController.loginHostFamily);
router.post("/verify-email", authController.verifyEmail);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
