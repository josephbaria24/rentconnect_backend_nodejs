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


module.exports = router;
