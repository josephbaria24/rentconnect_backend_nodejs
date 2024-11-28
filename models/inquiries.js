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
  moveOutDate: { // New field for tracking the move-out date
    type: Date, // Date when the occupant is expected to move out
    required: false // optional, as not all inquiries will have a move-out date
  },
  roomBills: [{
    dueDate: { 
      type: Date 
    }, 
    isPaid: { 
      type: Boolean, 
      default: false 
    }, // Shared isPaid status for all utilities in this roomBill entry
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {  // Modify this to be an object to store both type and details
      type: { 
        type: String,  // 'E-wallet', 'Hand-to-hand', 'Bank'
      },
      details: { 
        type: String,  // Account details or relevant info for the selected method
        required: false 
      }
    },
    electricity: { 
      amount: { 
        type: Number 
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
