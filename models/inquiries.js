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
    enum: ['reserved', 'rented', 'pending'], 
    default: 'pending' 
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
