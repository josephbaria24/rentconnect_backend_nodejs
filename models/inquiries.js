// models/inquiry.js
const db = require('../config/db')
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
}, // Occupant
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
}, // Room
  status: { 
    type: String,
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  requestType: { 
    type: String, 
    enum: ['reservation', 'rent'], 
    required: true 
  }, // New field
  isRented: { // New field to indicate if the inquiry is now rented
    type: Boolean,
    default: false
  },
  requestDate: { 
    type: Date, 
    default: Date.now 
},
  responseDate: {
     type: Date 
    },
  details: {
    price: Number,
    capacity: Number,
    deposit: Number,
    advance: Number,
  },
});

module.exports = db.model('Inquiry', inquirySchema);
