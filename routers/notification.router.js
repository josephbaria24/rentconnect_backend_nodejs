const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { markAllAsRead } = require('../services/notification.services');
const Room = require('../models/room.model'); 

// Route to create a notification (for example, when property is approved)
router.post('/create', notificationController.createNotification);

// Route to fetch unread notifications for a user
router.get('/unread/:userId', notificationController.getUnreadNotifications);

// Route to mark all notifications as read
router.patch('/:_id/read', notificationController.markAsRead)
router.patch('/readAll', notificationController.markAllAsRead)

// Route to clear notifications for a specific user
router.delete('/clear/:userId', notificationController.clearNotifications);


// router.post('/create-inquiry', async (req, res) => {
//     const { roomId, name, contact, message } = req.body;
    
//     try {
//         // Create the inquiry details
//         const inquiryDetails = { name, contact, message };

//         // Add inquiry to the room
//         const room = await Room.findById(roomId);
//         if (!room) {
//             return res.status(404).json({ error: 'Room not found' });
//         }

//         room.reservationInquirers.push(inquiryDetails);
//         await room.save();

//         // Call the notification function
//         sendNotification(roomId, inquiryDetails);

//         // Respond to the client
//         res.status(201).json({ success: 'Inquiry created successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

module.exports = router;
