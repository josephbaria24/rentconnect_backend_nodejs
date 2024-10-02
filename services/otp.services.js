const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const key = 'test123'; // Secret key for hashing
const emailServices = require('../services/emailer.services');

// In-memory store (you can replace this with Redis or a DB for persistence)
const otpStore = {};

// Generate OTP and store in-memory (or DB) for the email
async function sendOTP(params, callback) {
    const email = params.email;

    // Check if OTP exists and is still valid
    if (otpStore[email] && otpStore[email].expires > Date.now()) {
        // Send the existing OTP
        const existingOTP = otpStore[email].otp;
        sendOTPEmail(email, existingOTP, otpStore[email].hash, callback);
    } else {
        // Generate a new OTP
        const otp = otpGenerator.generate(4, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        const ttl = 5 * 60 * 1000; // OTP expiration time (5 minutes)
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
        const fullHash = `${hash}.${expires}`;

        // Save OTP and expiry in the in-memory store (or database)
        otpStore[email] = {
            otp,
            expires,
            hash: fullHash
        };

        // Send the new OTP
        sendOTPEmail(email, otp, fullHash, callback);
    }
}

// Reusable function to send OTP email
function sendOTPEmail(email, otp, hash, callback) {
    // Prepare the email parameters
    const emailParams = {
        email,
        subject: "Registration OTP",
        otp // Pass the OTP to the email service
    };

    // Send the OTP email using the email service
    emailServices.sendVerificationEmail(emailParams.email, emailParams.otp, (error, result) => {
        if (error) {
            return callback(error);
        }
        return callback(null, hash); // Send back the hash for future OTP verification
    });
}

// Verify OTP
async function verifyOTP(params, callback) {
    const { email, otp, hash } = params;
    
    if (!otpStore[email]) {
        return callback("No OTP found for this email");
    }

    const [hashValue, expires] = otpStore[email].hash.split('.');

    if (Date.now() > parseInt(expires)) {
        return callback("OTP Expired");
    }

    const data = `${email}.${otp}.${expires}`;
    const newCalculatedHash = crypto.createHmac("sha256", key).update(data).digest("hex");

    if (newCalculatedHash === hashValue) {
        // OTP verified successfully, clear it from the store
        delete otpStore[email];
        return callback(null, "Success");
    } else {
        return callback("Invalid OTP");
    }
}

module.exports = { 
    sendOTP, 
    verifyOTP 
};
