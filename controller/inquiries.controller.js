// controllers/inquiryController.js

const inquiryService = require('../services/inquiries.services');
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries')
const RoomServices = require('../services/room.services')

// Create a new inquiry
const createInquiry = async (req, res) => {
  try {
    const { userId, roomId, requestType } = req.body;

    if (!['reservation', 'rent'].includes(requestType)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    const inquiry = new Inquiry({
      userId,
      roomId,
      requestType, // Set requestType here
      status: 'pending',
    });

    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get inquiries for a specific user
const getInquiriesByUserId = async (req, res) => {
  try {
    const inquiries = await inquiryService.getInquiriesByUserId(req.params.userId);
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get inquiries for rooms associated with a landlord
const getInquiriesByRoomOwner = async (req, res) => {
  try {
    const inquiries = await inquiryService.getInquiriesByRoomOwner(req.params.ownerId);
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update inquiry status
const updateInquiryAndRoom = async (req, res) => {
  const { inquiryId } = req.params;
  const { status, requestType, roomId, userId } = req.body;

  try {
      // Log incoming request data
      console.log('Incoming request data:', req.body);

      // Update the inquiry status
      const updatedInquiry = await Inquiry.findByIdAndUpdate(inquiryId, {
          status: status,
          requestType: requestType,
          roomId: roomId,
          userId: userId
      }, { new: true });

      // Log updated inquiry
      console.log('Updated Inquiry:', updatedInquiry);

      if (!updatedInquiry) {
          return res.status(404).send('Inquiry not found');
      }

      // Ensure the room status is updated after the inquiry update
      const updatedRoom = await Room.findByIdAndUpdate(roomId, {
          roomStatus: 'reserved', // Set room status to reserved
          $addToSet: { occupantUsers: userId } // Add userId to occupantUsers
      }, { new: true });

      // Log updated room
      console.log('Updated Room:', updatedRoom);

      if (!updatedRoom) {
          return res.status(404).send('Room not found');
      }

      // Return the updated inquiry and room
      res.status(200).json({ inquiry: updatedInquiry, room: updatedRoom });
  } catch (error) {
      console.error('Error updating inquiry and room:', error);
      res.status(500).send('Server error');
  }
};


const getInquiriesByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    
    // First, find all rooms associated with the property ID
    const rooms = await Room.find({ propertyId });
    
    // If no rooms are found, return an empty array
    if (!rooms.length) {
      return res.status(200).json([]);
    }

    // Then, find inquiries for the rooms
    const inquiries = await Inquiry.find({ roomId: { $in: rooms.map(room => room._id) } }).populate('roomId');
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getInquiriesByRoomId = async (req, res) => {
  try {
    const inquiries = await inquiryService.getInquiriesByRoomId(req.params.roomId);
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const checkPendingInquiry = async (req, res) => {
  try {
    const { userId, roomId } = req.query;

    if (!userId || !roomId) {
      return res.status(400).json({ message: 'userId and roomId are required.' });
    }

    // Find if there is a pending inquiry for this user and room
    const existingInquiry = await Inquiry.findOne({
      userId,
      roomId,
      status: 'pending'
    });

    if (existingInquiry) {
      return res.json({ hasPendingRequest: true });
    } else {
      return res.json({ hasPendingRequest: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const deleteInquiry = async (req, res) => {
  try {
    const inquiryId = req.params.inquiryId;
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await Inquiry.findByIdAndDelete(inquiryId); // Updated to use findByIdAndDelete
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  deleteInquiry,
  checkPendingInquiry,
  getInquiriesByRoomId,
  createInquiry,
  getInquiriesByUserId,
  getInquiriesByRoomOwner,
  updateInquiryAndRoom,
  getInquiriesByPropertyId, // Add this line
};