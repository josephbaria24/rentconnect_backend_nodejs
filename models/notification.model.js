const mongoose = require('mongoose');
const db = require('../config/db')

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: { // Added status field
    type: String,
    enum: ['unread', 'read'], // You can define the possible status values
    default: 'unread' // Default value
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Notification = db.model('Notification', NotificationSchema);
module.exports = Notification;
