const express = require('express');
const authController = require('../../controllers/v1/authController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/signup-with-email", authController.signUpWithEmail);
router.post("/verify-email-otp", authController.verifyEmailOTP);
router.post("/resend-email-otp", authController.resendEmailOTP);
router.post("/login-with-email", authController.loginWithEmail);
router.post("/signup-verify-number", jwtMiddleware, authController.initiateMobileVerification);
router.post("/verify-mobile-otp", jwtMiddleware, authController.verifyMobileOTP);

module.exports = router;
