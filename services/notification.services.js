const Notification = require('../models/notification.model');



exports.createNotification = async (userId, message, status = 'unread') => {
  try {
    const notification = new Notification({
      userId,
      message,
      status // Use the status parameter
    });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Service to fetch unread notifications for a specific user
exports.getUnreadNotifications = async (userId) => {
  try {
    return await Notification.find({ userId, status: 'unread' }).sort({ created_at: -1 });
  } catch (error) {
    throw new Error('Error fetching unread notifications: ' + error.message);
  }
};

// Service to mark all notifications as read for a user
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
  } catch (error) {
    throw new Error('Error marking notifications as read: ' + error.message);
  }
};
