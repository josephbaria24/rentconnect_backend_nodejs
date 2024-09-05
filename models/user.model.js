const mongoose = require('mongoose');
const db = require('../config/db');
const bcrypt = require('bcryptjs');


const { Schema } = mongoose;


const userSchema = new Schema({
    // name: {
    //     type: String,
    //     lowercase: true,
    //     required: true,
    //     unique: true, 
    // },
    email: {
       type: String,
       lowercase: true,
       required: true,
       unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['occupant', 'landlord', 'admin'],
        default: 'occupant'
    },
    
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    bookmarks: [ // New field for storing bookmarked properties
    {
        type: Schema.Types.ObjectId,
        ref: 'Property' // Assuming you have a 'Property' model
    }
]
});


userSchema.pre('save', async function (next) {
    const user = this;
    
    // Check if the password field is modified
    if (!user.isModified('password')) {
        return next(); // Skip rehashing and move to next middleware
    }

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next(); // Proceed with saving the user
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.comparePassword = async function(userPassword){
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error
    }
}

const UserModel = db.model('user', userSchema);

module.exports = UserModel;