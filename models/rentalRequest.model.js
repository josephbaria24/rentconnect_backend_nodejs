const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const rentalRequestSchema = new Schema({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
});

const RentalRequestModel = db.model('RentalRequest', rentalRequestSchema, 'rentalRequests');
module.exports = RentalRequestModel;
