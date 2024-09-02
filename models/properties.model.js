const db = require('../config/db');
const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { Schema } = mongoose;

const propertySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: UserModel.modelName,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    photo: {
        type: String, // URL to the photo
        required: true
    },
    address: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },

    numberOfRooms: {
        type: Number,
        required: true
    },
    amenities: {
        type: [String], // Array of amenities
        default: []
    },
    availableFrom: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'rented'],
        default: 'available'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const PropertyModel = db.model('Property', propertySchema);

module.exports = PropertyModel;
