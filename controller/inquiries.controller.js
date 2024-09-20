// controllers/inquiryController.js

const inquiryService = require('../services/inquiries.services');
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries')

// Create a new inquiry
const createInquiry = async (req, res) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
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
const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await inquiryService.updateInquiryStatus(req.params.inquiryId, req.body.status);
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  updateInquiryStatus,
  getInquiriesByPropertyId, // Add this line
};