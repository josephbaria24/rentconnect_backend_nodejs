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
        const resetLink = `https://rentconnect-backend-nodejs.onrender.com/reset-password/${resetToken}`; // Use your local IP address

        const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center; background-color: #295F98; padding: 10px; border-radius: 10px 10px 0 0;">
                <h2 style="color: white; font-size: 24px;">RentConnect</h2>
            </div>

            <div style="padding: 20px; text-align: center;">
                <h3 style="font-size: 20px; color: #333;">Password Reset Request</h3>
                <p style="font-size: 16px; color: #555;">
                    Hello,
                </p>
                <p style="font-size: 16px; color: #555;">
                    We received a request to reset your password for your RentConnect account. Click the button below to reset your password:
                </p>
                <a href="${resetLink}" 
                    style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
                    Reset Password
                </a>
                <p style="font-size: 14px; color: #555;">
                    If you didn't request this, you can safely ignore this email. This link will expire in one hour.
                </p>
            </div>

            <div style="background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="font-size: 12px; color: #999;">
                    RentConnect | Ensuring Safe and Compliant Property Connections
                </p>
            </div>
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
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 50px; text-align: center;">
            <div style="max-width: 400px; margin: auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                <p style="color: #555; margin-bottom: 30px;">Please enter your new password below:</p>
                
                <form action="/reset-password/${token}" method="POST" style="display: flex; flex-direction: column; gap: 20px;">
                    <input type="password" name="newPassword" placeholder="New Password" required 
                        style="padding: 10px; font-size: 16px; border-radius: 5px; border: 1px solid #ccc;">
                    <button type="submit" style="padding: 12px; background-color: #4CAF50; color: white; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">
                        Reset Password
                    </button>
                </form>

                <p style="color: #999; margin-top: 20px; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
            </div>
        </div>
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
