const express = require('express');
const axios = require('axios');
const router = express.Router(); // Using Express Router

// Function to send verification SMS via Brevo
async function sendVerificationSMS(phoneNumber, otp, callback) {
    const apiKey = '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'; // Replace with your Brevo API Key

    const smsData = {
        sender: 'RentConnect', // Your sender name (max 11 characters)
        recipient: phoneNumber, // The recipient's phone number in international format (e.g., +1234567890)
        content: `Your RentConnect OTP is: ${otp}`, // Message content
    };

    try {
        const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', smsData, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        // Callback with success
        callback(null, response.data);
    } catch (error) {
        // Callback with error
        callback(error);
    }
}

// Define the route for sending OTP via SMS
router.post('/send-sms', (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Call the function to send SMS
    sendVerificationSMS(phoneNumber, otp, (error, response) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
        }

        return res.status(200).json({ message: 'SMS sent successfully', response });
    });
});

module.exports = router;
