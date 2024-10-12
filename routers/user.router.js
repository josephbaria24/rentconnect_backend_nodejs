const express = require('express'); // Add this import
const router = express.Router(); 
const UserController = require('../controller/user.controller');
const upload = require('../multerConfig');
const otpService = require('../services/otp.services');
const { sendVerificationEmail } = require('../services/emailer.services'); // Your email service
const User = require('../models/user.model'); // Your User model
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

router.post('/registration', UserController.register);
router.post('/login', UserController.login);
router.get('/getUserEmail/:userId', UserController.getUserEmailById);
router.post('/addBookmark/', UserController.addBookmark);
router.post('/removeBookmark/', UserController.removeBookmark);
router.get('/getUserBookmarks/:userId', UserController.getUserBookmarks);

router.patch('/updateProfileCompletion', UserController.updateProfileCompletion);
router.get('/user/:id', UserController.getUserDetails);
router.patch('/updateProfilePicture/:userId', upload.any(), UserController.updateProfilePicture);
router.patch('/updateUserInfo', UserController.updateUserInfo);
router.post('/createRentalRequest', UserController.createRentalRequest);
router.get('/notifications/:userId', UserController.getUserNotifications);
router.patch('/updatePassword', UserController.updatePassword);
router.post('/verify-email-otp', UserController.verifyEmailOTP);

// Resend OTP Route
router.post('/resend-otp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Call the sendOTP service function
    otpService.sendOTP({ email }, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: "Error sending OTP", error: err });
        }

        return res.status(200).json({
            message: "OTP resent successfully",
            otpHash: hash // Return the hash, which the client will store for future OTP verification
        });
    });
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Create reset link
        const resetLink = `http://192.168.1.19:3000/reset-password/${resetToken}`; // Use your local IP address

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" style="color: #4CAF50;">Reset Password</a>
                <p>This link will expire in one hour.</p>
            </div>
        `;

        await sendVerificationEmail(email, htmlBody, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'Reset link sent to your email' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});


// Reset Password Route
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    // Log the token being checked
    console.log("Token from URL:", token);
    console.log("Current Time:", Date.now());

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Render the reset password form
    res.send(`
        <form action="/reset-password/${token}" method="POST">
            <h2>Reset Your Password</h2>
            <input type="password" name="newPassword" placeholder="New Password" required>
            <button type="submit">Reset Password</button>
        </form>
    `);
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update the password directly without manual hashing
        user.password = newPassword; // Set the new password

        // Clear the reset token and expiration
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpires = undefined; 

        await user.save(); // This will trigger the pre-save middleware to hash the password

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});



module.exports = router;
