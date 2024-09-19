const notificationService = require('../services/notification.services');
const Notification = require('../models/notification.model');

// Controller to create a notification (called after property approval)
exports.createNotification = async (req, res) => {
  const { userId, message, roomId, roomNumber, requesterEmail, inquiryId } = req.body;

  // Check if required fields are provided
  if (!userId || !message) {
    return res.status(400).json({ status: false, error: 'userId and message are required' });
  }

  try {
    const notification = await notificationService.createNotification(
      userId, 
      message, 
      'unread', 
      roomId, 
      roomNumber, 
      requesterEmail,
      inquiryId // Pass inquiryId to the service
    );
    res.status(201).json({ status: true, notification });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Controller to get unread notifications for a user
exports.getUnreadNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await notificationService.getUnreadNotifications(userId);
    res.status(200).json({ status: true, notifications });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Controller to mark a notification as read
exports.markAsRead = async (req, res) => {
  const { _id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      _id,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: false, error: 'Notification not found' });
    }

    res.status(200).json({ status: true, notification });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ status: false, error: 'UserId is required' });
    }

    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({ status: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Controller to clear all notifications for a user
exports.clearNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ status: false, error: 'UserId is required' });
    }

    await Notification.deleteMany({ userId });

    res.status(200).json({ status: true, message: 'Notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
