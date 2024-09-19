const Notification = require('../models/notification.model');

exports.createNotification = async (userId, message, status = 'unread', roomId = null, roomNumber = null, requesterEmail = null, inquiryId = null) => {
  try {
    const notification = new Notification({
      userId,
      message,
      status,
      roomId,
      roomNumber,
      requesterEmail,
      inquiryId // Include inquiryId here
    });
    await notification.save();
    return notification; // Return the saved notification for further use
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error(error.message);
  }
};

// Fetch unread notifications for a specific user
exports.getUnreadNotifications = async (userId) => {
  try {
    return await Notification.find({ userId, status: 'unread' }).sort({ created_at: -1 }).populate('inquiryId'); // Populate inquiryId
  } catch (error) {
    throw new Error('Error fetching unread notifications: ' + error.message);
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany({ userId, status: 'unread' }, { status: 'read' });
  } catch (error) {
    throw new Error('Error marking notifications as read: ' + error.message);
  }
};
