const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');

// Route to create a notification (for example, when property is approved)
router.post('/create', notificationController.createNotification);

// Route to fetch unread notifications for a user
router.get('/unread/:userId', notificationController.getUnreadNotifications);

// Route to mark all notifications as read
router.patch('/:notificationId/read', notificationController.markAsRead)

// Route to clear notifications for a specific user
router.delete('/clear/:userId', notificationController.clearNotifications);


module.exports = router;
