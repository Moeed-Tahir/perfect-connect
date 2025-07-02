const express = require('express');
const hostFamilyController = require('../../controllers/v1/hostFamilyController');
const router = express.Router();
router.post("/createHostConnectData", hostFamilyController.createHostConnectData);
router.post("/createHostHeavenData", hostFamilyController.createHostHeavenData);

module.exports = router;
