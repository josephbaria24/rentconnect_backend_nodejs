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
        subject: "Notification",
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

async function sendRentalAgreementEmail(
    landlordEmail,
    landlordFullName,
    landlordContactDetails, // Expecting an object with phone and address
    occupantEmail,
    occupantFullName,
    occupantContactDetails, // Expecting an object with phone and address
    rentalAgreement,
    callback
) {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px; max-width: 600px; margin: auto;">
            <h2 style="text-align: center; color: #4CAF50;">Rental Agreement</h2>
            <p style="text-align: right;">Date: ${new Date().toLocaleDateString()}</p>

            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin: 0;">Agreement Between:</h4>
                <p style="margin: 5px 0;"><strong>Landlord:</strong> ${landlordFullName} (Email: ${landlordEmail})</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${landlordContactDetails.phone}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${landlordContactDetails.address}</p>
                <p style="margin: 5px 0;"><strong>Occupant:</strong> ${occupantFullName} (Email: ${occupantEmail})</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${occupantContactDetails.phone}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${occupantContactDetails.address}</p>
                <p style="margin: 5px 0;"><strong>Room ID:</strong> ${rentalAgreement.roomId}</p>
            </div>

            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin: 0;">Terms of Agreement:</h4>
                <p style="margin: 5px 0;"><strong>Monthly Rent:</strong> ₱${rentalAgreement.monthlyRent}</p>
                <p style="margin: 5px 0;"><strong>Security Deposit:</strong> ${rentalAgreement.securityDeposit}</p>
                <p style="margin: 5px 0;"><strong>Lease Start Date:</strong> ${rentalAgreement.leaseStartDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Lease End Date:</strong> ${rentalAgreement.leaseEndDate ? rentalAgreement.leaseEndDate.toLocaleDateString() : 'To be determined'}</p>
                <p style="margin: 5px 0;"><strong>Terms:</strong> ${rentalAgreement.terms}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${rentalAgreement.status}</p>
            </div>

            <footer style="text-align: center; margin-top: 40px; font-size: 12px; color: #888;">
                <p>&copy; ${new Date().getFullYear()} RentConnect. All rights reserved.</p>
            </footer>
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
        to: [landlordEmail, occupantEmail], // Recipients' emails
        subject: "Your Rental Agreement",
        html: htmlBody // HTML body of the email
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });
}

// Function to send billing statement email to the occupant
async function sendBillingStatementEmail(occupantEmail, billingStatement, callback) {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px; max-width: 600px; margin: auto;">
            <h2 style="text-align: center; color: #4CAF50;">Billing Statement</h2>
            <p style="text-align: right;">Date: ${new Date().toLocaleDateString()}</p>

            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h4 style="margin: 0;">Dear Occupant,</h4>
                <p style="margin: 5px 0;">Here is your billing statement:</p>
                <p style="margin: 5px 0;"><strong>Bill ID:</strong> ${billingStatement.billId}</p>
                <p style="margin: 5px 0;"><strong>Due Date:</strong> ${billingStatement.dueDate.toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Total Amount Due:</strong> ₱${billingStatement.totalAmount}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${billingStatement.isPaid ? 'Paid' : 'Pending'}</p>
            </div>

            <footer style="text-align: center; margin-top: 40px; font-size: 12px; color: #888;">
                <p>&copy; ${new Date().getFullYear()} RentConnect. All rights reserved.</p>
            </footer>
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
        to: occupantEmail,                  // Occupant's email
        subject: "Your Billing Statement",  // Subject of the email
        html: htmlBody                      // HTML body of the email
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });
}

// Function to send proof upload notification email to the landlord
async function sendProofUploadNotificationEmail(landlordEmail, occupantName, roomId, proofType, callback) {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Dear Landlord,</h2>
            <p>The occupant <strong>${occupantName}</strong> has uploaded a proof of ${proofType} for Room ID: <strong>${roomId}</strong>.</p>
            <p>Please review the submitted document at your earliest convenience.</p>
            <p>Best regards,</p>
            <p>The RentConnect Team</p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: '7d268b001@smtp-brevo.com',  // Your Brevo login
            pass: 'BwGgTIEQmzCOHqZ1'          // Your Brevo password
        }
    });

    const mailOptions = {
        from: 'rentconnect.it@gmail.com', // App's email
        to: landlordEmail,                 // Landlord's email
        subject: "New Proof Upload Notification",
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





module.exports = {
    sendVerificationEmail,
    sendNotificationEmail,
    sendOccupantNotificationEmail,
    sendResetPasswordEmail,
    sendRentalAgreementEmail,
    sendBillingStatementEmail,
    sendProofUploadNotificationEmail
};
