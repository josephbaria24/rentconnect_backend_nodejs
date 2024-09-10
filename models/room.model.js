const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const roomSchema = new Schema({
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Property', // Reference to the Property model
        required: true
    },
    roomNumber: {
        type: Number, // Room/Unit number (e.g., "No. 1", "No. 2")
        required: true
    },
    photo1: {
        type: String, // URL or path for the first photo
        required: true
    },
    photo2: {
        type: String, // URL or path for the second photo
        required: false
    },
    photo3: {
        type: String, // URL or path for the third photo
        required: false
    },
    price: {
        type: Number, // Price for the room (e.g., per month)
        required: true
    },
    capacity: {
        type: Number, // Capacity in terms of number of persons
        required: true
    },
    deposit: {
        type: Number, // Deposit for the room (in months of rent)
        required: true
    },
    advance: {
        type: Number, // Advance payment (in months of rent)
        required: true
    },
    reservationDuration: {
        type: Number, // Reservation duration (in days)
        required: true
    },
    reservationFee: {
        type: Number, // Fee for reserving the room
        required: true
    },
    occupantUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }],
    // Array for storing non-users (occupants)
    occupantNonUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'Occupant',
        required: false,
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const RoomModel = db.model('Room', roomSchema);
module.exports = RoomModel;
