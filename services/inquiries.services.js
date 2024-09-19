// services/inquiryService.js

const Inquiry = require('../models/inquiries');

// Create a new inquiry
const createInquiry = async (data) => {
  const inquiry = new Inquiry(data);
  return await inquiry.save();
};

// Fetch inquiries for a specific user (occupant)
const getInquiriesByUserId = async (userId) => {
  return await Inquiry.find({ userId }).populate('roomId');
};

// Fetch inquiries for rooms associated with a landlord
const getInquiriesByRoomOwner = async (ownerId) => {
  return await Inquiry.find({ 'roomId.ownerId': ownerId }).populate('roomId');
};

// Update inquiry status
const updateInquiryStatus = async (inquiryId, status) => {
  return await Inquiry.findByIdAndUpdate(inquiryId, { status }, { new: true });
};

module.exports = {
  createInquiry,
  getInquiriesByUserId,
  getInquiriesByRoomOwner,
  updateInquiryStatus,
};
