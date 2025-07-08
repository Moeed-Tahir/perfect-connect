const express = require('express');
const hostFamilyController = require('../../controllers/v1/hostFamilyController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();
// router.post("/createHostConnectData", hostFamilyController.createHostConnectData);
// router.post("/createHostHeavenData", hostFamilyController.createHostHeavenData);

router.post("/create-host-family-profile", jwtMiddleware, hostFamilyController.createHostFamily);

module.exports = router;
