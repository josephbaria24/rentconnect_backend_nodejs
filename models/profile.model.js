const mongoose = require('mongoose');
const db = require('../config/db');
const UserModel = require('./user.model');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;
const multer = require('multer');



// Multer configuration for storing files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
      cb(null, true);
  } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
      fileSize: 1024 * 1024 * 6, // 6 MB
  },
  fileFilter: fileFilter,
});


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
