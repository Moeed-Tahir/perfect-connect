const express = require('express');
const hostFamilyController = require('../../controllers/v1/hostFamilyController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/create-host-family-profile", jwtMiddleware, hostFamilyController.createHostFamily);
router.post("/getAllHostFamily", jwtMiddleware, hostFamilyController.getAllHostFamily);
router.post("/pauseHostFamily", jwtMiddleware, hostFamilyController.pauseHostFamily);
router.post("/unpauseHostFamily", jwtMiddleware, hostFamilyController.unpauseHostFamily);

module.exports = router;

// if email not varified, send OTP to email
// if mobile not varified, send OTP to mobile
// if phone is varifed and taken, no other can use it 
// refreash token with each API call, and update token evrytime user hit an API 
// add data and token to data
// add family name to host family schema
// number issue resolve 
