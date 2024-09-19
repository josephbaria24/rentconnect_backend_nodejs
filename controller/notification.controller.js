const Notification = require('../models/notification.model');
const notificationService = require('../services/notification.services');

// Controller to create a notification (called after property approval)
exports.createNotification = async (req, res) => {
  const { userId, message } = req.body;

  // Check if required fields are provided
  if (!userId || !message) {
    return res.status(400).json({ status: false, error: 'userId and message are required' });
  }

  try {
    const notification = await notificationService.createNotification(userId, message);
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

// Controller to mark notifications as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
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
exports.clearNotifications = async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      // Check if the userId exists
      if (!userId) {
        return res.status(400).json({ status: false, error: 'UserId is required' });
      }
  
      // Clear notifications for the given user
      await Notification.deleteMany({ userId });
  
      res.status(200).json({ status: true, message: 'Notifications cleared successfully' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ status: false, error: error.message });
    }
  };