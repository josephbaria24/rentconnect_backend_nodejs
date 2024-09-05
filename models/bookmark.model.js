const mongoose = require('mongoose');
const db = require('../config/db');

// Define the Bookmark schema
const BookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the Bookmark model
const BookmarkModel = db.model('Bookmark', BookmarkSchema);

module.exports = BookmarkModel;
