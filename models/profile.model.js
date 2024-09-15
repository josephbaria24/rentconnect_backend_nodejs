const mongoose = require('mongoose');
const db = require('../config/db');
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
    ref: 'user',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
  },
  valid_id: {
    type: String, // URL to the valid ID photo
    required: true // Making it optional as it might not be immediately available
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
  profileStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'none'], 
    default: 'none' 
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

const ProfileModel = db.model('Profile', profileSchema, 'pending_request_profile');

module.exports = {
  ProfileModel,
  upload
};
