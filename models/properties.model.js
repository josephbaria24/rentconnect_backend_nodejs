const db = require('../config/db');
const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { Schema } = mongoose;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, req.decoded.userId + path.extname(file.originalname)); // Use original file extension
      }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
};

const upload = multer({
    storage:storage,
    limits: {
        fileSize: 1024 * 1024 * 6,
    },
    fileFilter: fileFilter,
});
module.exports = upload;


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
    legalDocPhoto: {
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

