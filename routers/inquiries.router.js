// routes/inquiryRoutes.js

const express = require('express');
const router = express.Router();
const inquiryController = require('../controller/inquiries.controller');
const User = require('../models/user.model');
const Inquiry = require('../models/inquiries');

// Create a new inquiry
router.post('/create', inquiryController.createInquiry);

// Get inquiries for a specific user
router.get('/occupant/:userId', inquiryController.getInquiriesByUserId);

// Get inquiries for rooms associated with a landlord
router.get('/landlord/:ownerId', inquiryController.getInquiriesByRoomOwner);

// Update inquiry status
router.patch('/update/:inquiryId', inquiryController.updateInquiryAndApprove);
// Get inquiries for a specific property
router.get('/properties/:propertyId/inquiries', inquiryController.getInquiriesByPropertyId);
router.get('/rooms/:roomId', inquiryController.getInquiriesByRoomId);
router.get('/check-pending', inquiryController.checkPendingInquiry);
router.delete('/delete/:inquiryId', inquiryController.deleteInquiry);
router.put('/inquiries/mark-as-occupied/:roomId', inquiryController.markRoomAsOccupied);
router.patch('/reject/:inquiryId', inquiryController.rejectInquiry);
router.get('/room/:roomId/property', inquiryController.getPropertyByRoomId);


router.get('/:inquiryId/email', async (req, res) => {
    try {
        const inquiryId = req.params.inquiryId;

        // Find the inquiry by inquiryId
        const inquiry = await Inquiry.findById(inquiryId).populate('userId', 'email');

        if (!inquiry || !inquiry.userId) {
            return res.status(404).json({ message: 'Inquiry or occupant not found' });
        }

        return res.status(200).json({ email: inquiry.userId.email });
    } catch (error) {
        console.error('Error fetching occupant email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:inquiryId', async (req, res) => {
    try {
        const inquiryId = req.params.inquiryId;

        // Find the inquiry by inquiryId and populate user details
        const inquiry = await Inquiry.findById(inquiryId).populate('userId', 'email');

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        // Return inquiry details including userId and requesterEmail (assumed to be inquiry.userId.email)
        return res.status(200).json({
            inquiryId: inquiry._id,
            userId: inquiry.userId._id, // userId
            requesterEmail: inquiry.userId.email, // Occupant email
            roomNumber: inquiry.roomNumber, // Assuming room number exists in your model
            status: inquiry.status
        });
    } catch (error) {
        console.error('Error fetching inquiry details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/email/:userEmail/inquiries', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;

        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user._id;

        // Find inquiries associated with the found userId
        const inquiries = await Inquiry.find({ userId }).populate('roomId');

        if (!inquiries || inquiries.length === 0) {
            return res.status(404).json({ message: 'No inquiries found for this user' });
        }

        return res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;
