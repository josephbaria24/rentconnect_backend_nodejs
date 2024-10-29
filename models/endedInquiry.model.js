// models/endedInquiry.model.js

const db = require('../config/db');
const mongoose = require('mongoose');

const endedInquirySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
  },
  requestType: { 
    type: String, 
    enum: ['reservation', 'rent'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['ended'], 
    default: 'ended' 
  },
  moveOutDate: { 
    type: Date, 
    required: true 
  },
  requestDate: { 
    type: Date, 
    default: Date.now 
  },
  // Include other fields you may want to keep
});

module.exports = db.model('EndedInquiry', endedInquirySchema);
