const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller');

// Route to update profile details
router.patch('/updateProfile', profileController.updateProfile);

// Route to upload valid ID image
router.patch('/uploadValidId', profileController.uploadValidId);

router.get('/checkProfileCompletion/:userId', profileController.checkProfileCompletion);

module.exports = router;
