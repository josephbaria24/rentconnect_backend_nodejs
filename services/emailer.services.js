const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, otp, callback) {
    // Construct the email body with HTML
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Dear ${email},</h2>
            <p>This is the one-time verification code for your registration to the RentConnect Application:</p>
            <h3 style="color: #4CAF50;">${otp}</h3>
            <p>You can copy this code for verification.</p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // use TLS
        auth: {
            user: '7d268b001@smtp-brevo.com',  // Your Brevo login
            pass: 'BwGgTIEQmzCOHqZ1'          // Your Brevo password
        }
    });

    const mailOptions = {
        from: 'rentconnect.it@gmail.com',  // Replace with your verified sender email
        to: email,                         // Recipient's email
        subject: "Registration OTP",       // Subject of the email
        html: htmlBody                     // HTML body of the email
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });
}

module.exports = {
    sendVerificationEmail
};
