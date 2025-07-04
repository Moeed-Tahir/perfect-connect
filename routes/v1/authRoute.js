const express = require('express');
const authController = require('../../controllers/v1/authController');
const router = express.Router();

// router.post("/signUpHostFamilyWithPhone", authController.signUpHostFamilyWithPhone);
// router.post("/signUpHostFamilyWithEmail", authController.signUpHostFamilyWithEmail);
// router.post("/loginHostFamily", authController.loginHostFamily);
// router.post("/verify-email", authController.verifyEmail);
// router.post("/verify-otp", authController.verifyOTP);
// router.post("/resend-otp", authController.resendOTP);
// router.post("/toggleHostFamilyCategory", authController.toggleHostFamilyCategory);
router.post("/signup-with-email", authController.signUpWithEmail);
router.post("/verify-email-otp", authController.verifyEmailOTP);
router.post("/resend-email-otp", authController.resendEmailOTP);

module.exports = router;
