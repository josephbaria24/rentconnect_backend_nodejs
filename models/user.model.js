const mongoose = require('mongoose');
const db = require('../config/db');
const bcrypt = require('bcrypt');

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
    }
});


userSchema.pre('save', async function(){
    try {
        var user = this;
        const salt = await(bcrypt.genSalt(10));
        const hashpass = await bcrypt.hash(user.password, salt);
        user.password = hashpass;
    } catch (error) {
        throw error;
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