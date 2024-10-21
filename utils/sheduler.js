// scheduler.js
const cron = require('node-cron');
const NotificationService = require('../services/notification.services');
const RoomModel = require('../models/room.model'); // Import your Room model

// Schedule the cron job to run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    // Set the time to midnight to compare with due dates
    today.setHours(0, 0, 0, 0); // Reset time to compare only the date

    try {
        const rooms = await RoomModel.find({ dueDate: { $eq: today } });

        for (const room of rooms) {
            const occupants = room.occupantUsers; // Get user IDs from room
            // Notify each occupant about the due date
            for (const occupantId of occupants) {
                await NotificationService.createNotification(
                    occupantId,
                    `Rent is due for room ${room.roomNumber} today.`
                );
            }
        }
    } catch (error) {
        console.error('Error fetching rooms for due date notifications:', error);
    }
});
