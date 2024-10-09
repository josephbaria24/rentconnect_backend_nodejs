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
        type: String, // Deposit for the room (in months of rent)
        required: false
    },
    advance: {
        type: String, // Advance payment (in months of rent)
        required: false
    },
    roomStatus: {
        type: String,
        enum: ['occupied', 'available', 'reserved'],
        default: 'available'
    },
    dueDate: {
        type: Date, // Date type for the due date
        required: false // Optional field, adjust based on your needs
    },
    rentedDate: {
        type: Date, // Date when the room was rented
        required: false
    },
    reservedDate: {
        type: Date, // Date when the room was reserved
        required: false
    },
    
    // New Field: Move-In Date
    moveInDate: {
        type: Date, // Date when the occupant can move in
        required: false // Optional field, only required when reservation is confirmed
    },
    
    // New Field: Reservation Expiration Date
    reservationExpiration: {
        type: Date, // Expiration date for the reservation
        required: false // Optional field
    },
    
    reservationDuration: {
        type: Number, // Reservation duration (in days)
        required: false
    },
    reservationFee: {
        type: Number, // Fee for reserving the room
        required: false
    },
    occupantUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
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
    },
    reservationInquirers: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    }],
    rentalRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'RentalRequest',
        required: false
    }],
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user' 
    }
});

const RoomModel = db.model('Room', roomSchema, 'rooms');
module.exports = RoomModel;
