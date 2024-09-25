const Notification = require('../models/notification.model');
let io; // Define io here to use it in your service

exports.setIoInstance = (socketIo) => {
  io = socketIo; // Set the io instance
};




exports.createNotification = async (userId, message, status = 'unread', roomId = null, roomNumber = null, requesterEmail = null, inquiryId = null) => {
  try {
    const notification = new Notification({
      userId,
      message,
      status,
      roomId,
      roomNumber,
      requesterEmail,
      inquiryId
    });
    await notification.save();
    
    // Emit the notification to the specific user
    if (io) {
      io.to(userId).emit('newNotification', notification); // Emit to the specific user
    }
    
    return notification; 
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
