const express = require('express');
const authController = require('../../controllers/v1/authController');
const router = express.Router();

// router.post('/signUpClient', upload.single('profilePhoto'), clientController.signUpClient);

router.post("/verify-email", authController.verifyEmail);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
