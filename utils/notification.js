// utils/notifications.js
const Room = require('../models/room.model');
const User = require('../models/user.model');
const { sendNotificationEmail } = require('../services/emailer.services'); // Your email service logic

const sendNotification = async (roomId, inquiryDetails) => {
    try {
        // Fetch the room details
        const room = await Room.findById(roomId).populate('ownerId');
        
        if (!room) {
            throw new Error('Room not found');
        }

        // Fetch landlord's details
        const landlord = await User.findById(room.ownerId);

        // Prepare notification content
        const notificationMessage = `
            Hello ${landlord.name},
            A new inquiry has been made for your room (Room Number: ${room.roomNumber}).
            Inquiry Details:
            Name: ${inquiryDetails.name}
            Contact: ${inquiryDetails.contact}
            Message: ${inquiryDetails.message}
        `;

        // Send email
        await sendNotificationEmail(landlord.email, 'New Inquiry for Your Room', notificationMessage);
        console.log('Notification sent to landlord:', landlord.email);

    } catch (error) {
        console.error('Error sending notification:', error.message);
    }
};

module.exports = { sendNotification };
