const nodemailer = require('nodemailer');

// Function to send verification email
async function sendVerificationEmail(email, otp, callback) {
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
// Function to send verification email
async function sendResetPasswordEmail(email, htmlBody, callback) {
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
        subject: "Reset Your RentConnect Password", // Updated subject
        html: htmlBody                     // HTML body passed as argument
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });
}

// Function to send notification email to the landlord
async function sendNotificationEmail(landlordEmail, message, callback) {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Dear User,</h2>
            <p>${message}</p>
            <p>Best regards,</p>
            <p>The RentConnect Team</p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, 
        auth: {
            user: '7d268b001@smtp-brevo.com',
            pass: 'BwGgTIEQmzCOHqZ1'
        }
    });

    const mailOptions = {
        from: 'rentconnect.it@gmail.com', // App's email
        to: landlordEmail, // Landlord's email
        subject: "New Inquiry Notification",
        html: htmlBody,
        replyTo: 'rentconnect.it@gmail.com' // Set the landlord's email as reply-to
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });
}

// Function to send notification email to the occupant
async function sendOccupantNotificationEmail(occupantEmail, message, callback) {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Dear Occupant,</h2>
            <p>${message}</p>
            <p>Best regards,</p>
            <p>The RentConnect Team</p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, 
        auth: {
            user: '7d268b001@smtp-brevo.com',
            pass: 'BwGgTIEQmzCOHqZ1'
        }
    });

    const mailOptions = {
        from: 'rentconnect.it@gmail.com', // App's email
        to: occupantEmail, // Occupant's email
        subject: "Inquiry Update Notification",
        html: htmlBody,
        replyTo: 'rentconnect.it@gmail.com' // Set the occupant's email as reply-to
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
    sendVerificationEmail,
    sendNotificationEmail,
    sendOccupantNotificationEmail,
    sendResetPasswordEmail // Export the occupant email function
};
