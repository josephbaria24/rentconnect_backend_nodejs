// routes/inquiryRoutes.js

const express = require('express');
const router = express.Router();
const inquiryController = require('../controller/inquiries.controller');

// Create a new inquiry
router.post('/create', inquiryController.createInquiry);

// Get inquiries for a specific user
router.get('/occupant/:userId', inquiryController.getInquiriesByUserId);

// Get inquiries for rooms associated with a landlord
router.get('/landlord/:ownerId', inquiryController.getInquiriesByRoomOwner);

// Update inquiry status
router.patch('/update/:inquiryId', inquiryController.updateInquiryStatus);

module.exports = router;
