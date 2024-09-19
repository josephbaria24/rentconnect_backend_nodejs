// controllers/inquiryController.js

const inquiryService = require('../services/inquiries.services');

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

module.exports = {
  createInquiry,
  getInquiriesByUserId,
  getInquiriesByRoomOwner,
  updateInquiryStatus,
};
