const mongoose = require('mongoose');
const db = require('../config/db');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ensure this matches your User model name
    required: true
  },
  message: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  roomNumber: {
    type: Number,
    required: false
  },
  requesterEmail: {
    type: String,
    required: false
  },
  inquiryId: { // New field for linking to the inquiry
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: false
  },
  status: {
    type: String,
    default: 'unread'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Notification = db.model('Notification', NotificationSchema);
module.exports = Notification;
