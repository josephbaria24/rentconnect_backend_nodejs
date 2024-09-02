const mongoose = require('mongoose');
const db = require('../config/db');
const UserModel = require('./user.model');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const profileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel', // Reference to the User model
        required: true
      },
      fullName: {
        type: String,
        required: true
      },
      schoolIdPhoto: {
        type: String, // URL to the school ID photo
        required: true
      },
      governmentIdPhoto: {
        type: String, // URL to the government ID photo
        required: true
      },
      contactDetails: {
        phone: {
          type: String,
          required: true
        },
        address: {
          type: String,
          required: true
        }
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      }
      
})
const ProfileModel = db.model('Profile', profileSchema);

module.exports = ProfileModel;
