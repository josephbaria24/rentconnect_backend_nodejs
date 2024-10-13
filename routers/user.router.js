const express = require('express'); // Add this import
const router = express.Router(); 
const UserController = require('../controller/user.controller');
const upload = require('../multerConfig');
const otpService = require('../services/otp.services');
const { sendVerificationEmail } = require('../services/emailer.services'); // Your email service
const { sendResetPasswordEmail } = require('../services/emailer.services'); // Your email service
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
        //const resetLink = `https://rentconnect-backend-nodejs.onrender.com/reset-password/${resetToken}`; // Use your local IP address
        const resetLink = `http://192.168.1.19:3000/reset-password/${resetToken}`; // Use your local IP address

        const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
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

        await sendResetPasswordEmail(email, htmlBody, (error) => {
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
    <!-- Add Material Icons link in your HTML head -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);">
        
        <!-- Image at the top with border-radius -->
        <img src="https://res.cloudinary.com/djk14aph3/image/upload/v1728255288/uploads/ren.png" alt="Reset Password" 
             style="width: 100%; max-width: 100px; height: auto; border-radius: 10px; margin-bottom: 25px;">

        <h2 style="color: #333; margin-bottom: 25px; font-size: 35px;">Reset Your Password</h2>
        <p style="color: #555; margin-bottom: 30px; font-size: 20px;">Please enter your new password below:</p>
        
        <form action="/reset-password/${token}" method="POST" style="display: flex; flex-direction: column; gap: 25px;">
            <!-- Password field with toggle visibility -->
            <div style="position: relative;">
                <input type="password" id="newPassword" name="newPassword" placeholder="New Password" required 
                    style="padding: 15px; font-size: 25px; border-radius: 8px; border: 1px solid #ccc; width: 100%; height: 70px;">
                
                <!-- Material Icons for Show/Hide -->
                <span id="togglePassword" class="material-icons" style="position: absolute; top: 50%; right: 15px; transform: translateY(-50%); cursor: pointer; color: #666; font-size: 24px;">
                    visibility
                </span>
            </div>

            <!-- Submit button -->
            <button type="submit" style="padding: 15px; background-color: #4CAF50; color: white; font-size: 18px; border: none; border-radius: 8px; cursor: pointer;">
                Reset Password
            </button>
        </form>

        <p style="color: #999; margin-top: 25px; font-size: 16px;">If you didn't request this, you can ignore this email.</p>
    </div>
</div>

<script>
    const togglePassword = document.querySelector('#togglePassword');
    const passwordField = document.querySelector('#newPassword');

    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        // Toggle the icon between visibility and visibility_off
        this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
</script>

    
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
            return res.status(400).send(`
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f8f8f8;
                            color: #333;
                            text-align: center;
                            padding: 50px;
                        }
                        h1 {
                            color: #c0392b;
                        }
                        p {
                            font-size: 16px;
                            margin: 20px 0;
                        }
                        a {
                            color: #2980b9;
                            text-decoration: none;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                        .container {
                            background: white;
                            border-radius: 8px;
                            padding: 20px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Invalid or expired token</h1>
                        <p>The token you provided is either invalid or has expired. Please request a new password reset link.</p>
                        <p><a href="rentconnect://forgot-password">Request New Link</a></p>
                    </div>
                </body>
                </html>
            `);
        }

        // Update the password directly without manual hashing
        user.password = newPassword; // Set the new password

        // Clear the reset token and expiration
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpires = undefined; 

        await user.save(); // This will trigger the pre-save middleware to hash the password

        res.status(200).send(`
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f8f8f8;
                        color: #333;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #27ae60;
                    }
                    p {
                        font-size: 16px;
                        margin: 20px 0;
                    }
                    a {
                        color: #2980b9;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    .container {
                        background: white;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Password Reset Successful</h1>
                    <p>Your password has been reset successfully. You can now login to the RentConnect App with your new password.</p>
                    <p><a href="rentconnect://login">Log In</a></p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f8f8f8;
                        color: #333;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #c0392b;
                    }
                    p {
                        font-size: 16px;
                        margin: 20px 0;
                    }
                    a {
                        color: #2980b9;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    .container {
                        background: white;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Server Error</h1>
                    <p>There was a problem with the server. Please try again later.</p>
                </div>
            </body>
            </html>
        `);
    }
});



module.exports = router;
