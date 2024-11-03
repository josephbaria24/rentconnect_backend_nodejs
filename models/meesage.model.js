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
    sentAt: {
        type: Date,
        default: Date.now
    }
});

const MessageModel = db.model('Message', messageSchema);

module.exports = MessageModel;
