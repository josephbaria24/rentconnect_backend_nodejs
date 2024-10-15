const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;


const rentalAgreementSchema = new Schema({
  occupantId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  landlordId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  monthlyRent: {
    type: Number, // Monthly rent amount
    required: true
  },
  securityDeposit: {
    type: String, // Security deposit
    required: true
  },
  leaseStartDate: {
    type: Date, // Lease start date
    required: true
  },
  leaseEndDate: {
    type: Date, // Lease end date
    required: false
  },
  terms: {
    type: String, // Custom terms of the agreement
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});


const RentalAgreement = db.model('RentalAgreement', rentalAgreementSchema);
module.exports = RentalAgreement;
