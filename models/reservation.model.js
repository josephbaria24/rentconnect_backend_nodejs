const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const reservationSchema = new Schema({
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
    reservationDate: {
        type: Date,
        default: Date.now
    }
});

const ReservationModel = db.model('Reservation', reservationSchema, 'reservations');
module.exports = ReservationModel;
