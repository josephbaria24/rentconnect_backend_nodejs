const axios = require('axios');

async function sendVerificationSMS(phoneNumber, otp, callback) {
    const apiKey = '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'; // Replace with your Brevo API Key

    const smsData = {
        sender: 'RentConnect', // Name of the sender (max 11 characters)
        recipient: phoneNumber, // The recipient's phone number in international format, e.g., +1234567890
        content: `Your RentConnect OTP is: ${otp}`, // Message content
    };

    try {
        const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', smsData, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Call the callback with success
        callback(null, response.data);
    } catch (error) {
        // Handle error and call the callback with the error
        callback(error);
    }
}
