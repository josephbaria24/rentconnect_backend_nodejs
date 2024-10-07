const express = require('express');
const router = express.Router();
const RoomController = require('../controller/rooms.controller');
const upload = require('../multerConfig'); // Import multer configuration
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries')

// Apply the upload middleware to routes that need file uploads
router.post('/createRoom', upload.any(), RoomController.createRoom);

router.post('/rooms/addUser', RoomController.addUserToRoom);
router.post('/rooms/addNonUser', RoomController.addNonUserToRoom);

router.get('/getRoom/:id', RoomController.getRoom);
router.patch('/updateRoom/:id', RoomController.updateRoom);
router.delete('/deleteRoom/:id', RoomController.deleteRoom);
router.get('/properties/:propertyId/rooms', RoomController.getRoomsByPropertyId);
router.post('/reserve', RoomController.reserveRoom);
router.post('/request-rent', RoomController.requestRent);
router.patch('/:roomId/occupy', async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
  
    try {
      // Update the room status, add the userId to occupantUsers, and remove userId from reservationInquirers
      await Room.updateOne(
        { _id: roomId },
        { 
          roomStatus: 'occupied', 
          $addToSet: { occupantUsers: userId },
          $pull: { reservationInquirers: userId } // Remove userId from reservationInquirers
        }
      );
  
      // Update the inquiry to mark it as rented
      await Inquiry.updateOne(
        { roomId: roomId, userId: userId, requestType: 'reservation' }, // Adjust the query as needed
        { 
          status: 'approved', // Set the status to approved if needed
          isRented: true // Mark the inquiry as rented
        }
      );
  
      return res.status(200).json({ message: 'Room marked as occupied and inquiry updated to rented' });
    } catch (error) {
      console.error('Error marking room as occupied:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  

module.exports = router;