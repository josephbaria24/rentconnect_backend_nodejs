//inquiry.model.js

const db = require('../config/db');
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
  reservationDuration: {  
    type: Number,
    required: function() {
      return this.requestType === 'reservation'; // Only required if requestType is 'reservation'
    }
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
  approvalDate: { // New field for the date of approval
    type: Date
  },
  details: {
    price: Number,
    capacity: Number,
    deposit: Number,
    advance: Number,
  },
  proposedStartDate: { // New field for proposed start date
    type: Date,
    required: false // optional, as not all requests might include this
  },
  customTerms: { // New field for custom terms/messages
    type: String,
    required: false
  },
  rejectionReason: {  // New field for storing the rejection reason
    type: String,
    required: false
  },
  moveInDate: {
    type: Date, 
  },

   roomBills: [{
    dueDate: { 
      type: Date 
    }, // Shared dueDate for all utilities
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    electricity: { 
      amount: { 
        type: Number 
      },
      isPaid: { 
        type: Boolean, 
        default: false 
      },
      paymentDate: { 
        type: Date 
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
    },
    water: { 
      amount: { 
        type: Number 
      },
      isPaid: { 
        type: Boolean, 
        default: false 
      },
      paymentDate: { 
        type: Date 
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
    },
    maintenance: { 
      amount: { 
        type: Number 
      },
      isPaid: { 
        type: Boolean, 
        default: false 
      },
      paymentDate: { 
        type: Date 
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
    },
    internet: { 
      amount: { 
        type: Number 
      },
      isPaid: { 
        type: Boolean, 
        default: false 
      },
      paymentDate: { 
        type: Date 
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      },
    },
  }],


  // New field for room repair requests
  roomRepairs: [{
    repairType: { 
      type: String, 
      required: true 
    }, // Type of repair requested
    description: { 
      type: String, 
      required: true 
    }, // Description of the repair
    requestDate: { 
      type: Date, 
      default: Date.now 
    }, // Date the repair was requested
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed'], 
      default: 'pending' 
    }, // Status of the repair
    completionDate: { 
      type: Date 
    } // Date the repair was completed
  }]
});

module.exports = db.model('Inquiry', inquirySchema);
