const mongoose = require('mongoose');
const { Schema } = mongoose;
const db = require('../config/db');

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    content: {
        type: String,
        required: true
    },
    iv: { 
        type: String, // Store the IV used during encryption 
        required: true 
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Map,
        of: Boolean,
        default: {}
    }
});

const MessageModel = db.model('Message', messageSchema);

module.exports = MessageModel;
