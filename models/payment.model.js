const mongoose = require('mongoose');
const db = require('../config/db');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    occupantId: {
        type: Schema.Types.ObjectId,
        ref: 'user', // Reference to the Occupant (User model)
        required: true
    },
    landlordId: {
        type: Schema.Types.ObjectId,
        ref: 'user', // Reference to the Landlord (User model)
        required: true
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room', // Reference to the Room (Room model)
        required: true
    },
    proofOfReservation: {
        type: String, // URL or path to the proof of reservation (photo)
        required: false // Optional, adjust based on your needs
    },
    monthlyPayments: [{
        month: {
            type: String, // Month of the payment (e.g., "September 2024")
            required: true
        },
        amount: {
            type: Number, // Payment amount for the month
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'rejected'],
            default: 'pending' // Default payment status is pending until confirmed
        },
        paymentMethod: {
            type: String, // Payment method chosen by the occupant (e.g., "Bank Transfer", "Cash")
            enum: ['bank transfer', 'cash', 'online payment', 'others'],
            required: false // Require the selection of a payment method
        },
        proofOfPayment: {
            type: String, // URL or path to the proof of payment (receipt photo)
            required: false
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        }
    }]
});

const PaymentModel = db.model('Payment', paymentSchema, 'payments');
module.exports = PaymentModel;
