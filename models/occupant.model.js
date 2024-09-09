const mongoose = require('mongoose');
const { Schema } = mongoose;
const db = require('../config/db')

const occupantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    age: {
        type: Number,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    emergencyNumber: {
        type: String,
        required: true
    }
});

const OccupantModel = db.model('Occupant', occupantSchema);
module.exports = OccupantModel;
