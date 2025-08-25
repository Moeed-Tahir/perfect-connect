const express = require('express');
const hostFamilyController = require('../../controllers/v1/hostFamilyController');
const jwtMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post("/create-host-family-profile", jwtMiddleware, hostFamilyController.createHostFamily);
router.post("/getAllHostFamily", jwtMiddleware, hostFamilyController.getAllHostFamily);
router.post("/pauseHostFamily", jwtMiddleware, hostFamilyController.pauseHostFamily);
router.post("/unpauseHostFamily", jwtMiddleware, hostFamilyController.unpauseHostFamily);
router.post("/likeHostFamilyProfile", jwtMiddleware, hostFamilyController.likeHostFamilyProfile);

module.exports = router;