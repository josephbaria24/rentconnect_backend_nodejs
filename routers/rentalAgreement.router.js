const express = require('express');
const router = express.Router();
const RentalAgreement = require('../models/rentalAgreemen.model');
const RoomModel = require('../models/room.model');
const Inquiry = require('../models/inquiries');

// POST: Create a rental agreement draft
router.post('/rental-agreement/draft', async (req, res) => {
    const { occupantId, landlordId, roomId, leaseEndDate, terms } = req.body;
  
    try {
      // Fetch the inquiry that corresponds to the roomId
      const inquiry = await Inquiry.findOne({ roomId, status: 'approved', requestType: 'reservation' });
  
      if (!inquiry) {
        return res.status(404).json({ error: 'No approved reservation found for this room' });
      }
  
      // Use inquiry's moveInDate as leaseStartDate
      const leaseStartDate = inquiry.moveInDate;
  
      if (!leaseStartDate) {
        return res.status(400).json({ error: 'Move-in date not set in the inquiry' });
      }
  
      // Fetch the room details for price
      const room = await RoomModel.findById(roomId);
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
  
      // Create a new rental agreement using the room's price as the security deposit
      const newAgreement = new RentalAgreement({
        occupantId,
        landlordId,
        roomId,
        monthlyRent: room.price, // Use room's price as the monthly rent
        securityDeposit: room.deposit, // Use room's price as the security deposit
        leaseStartDate, // Use moveInDate from inquiry model
        leaseEndDate,   // Optional, filled if provided
        terms,
        status: 'draft'
      });
  
      // Save the new rental agreement
      await newAgreement.save();
  
      // Return the created rental agreement
      res.status(201).json({ message: 'Rental agreement draft created', agreement: newAgreement });
    } catch (error) {
      console.error('Error creating rental agreement:', error);
      res.status(500).json({ error: 'Error creating draft' });
    }
});

// GET: Fetch rental agreement using inquiry
router.get('/rental-agreement/inquiry/:inquiryId', async (req, res) => {
    try {
        const inquiryId = req.params.inquiryId;

        // Fetch the inquiry by ID
        const inquiry = await Inquiry.findById(inquiryId).populate('roomId');

        if (!inquiry || inquiry.status !== 'approved' || inquiry.requestType !== 'reservation') {
            return res.status(404).json({ error: 'Approved reservation not found for this inquiry' });
        }

        // Find the rental agreement using the roomId from the inquiry
        const agreement = await RentalAgreement.findOne({ roomId: inquiry.roomId }).populate('occupantId landlordId');

        if (!agreement) {
            return res.status(404).json({ error: 'Rental agreement not found for this room' });
        }

        // Return the rental agreement details
        res.status(200).json({ agreement });
    } catch (error) {
        console.error('Error fetching rental agreement by inquiry:', error);
        res.status(500).json({ error: 'Error fetching rental agreement' });
    }
});

// GET: Fetch rental agreement by ID
router.get('/rental-agreement/:id', async (req, res) => {
    try {
        const agreementId = req.params.id;
        
        // Fetch the rental agreement by ID
        const agreement = await RentalAgreement.findById(agreementId).populate('occupantId landlordId roomId');

        if (!agreement) {
            return res.status(404).json({ error: 'Rental agreement not found' });
        }

        // Return the rental agreement details
        res.status(200).json({ agreement });
    } catch (error) {
        console.error('Error fetching rental agreement:', error);
        res.status(500).json({ error: 'Error fetching rental agreement' });
    }
});

module.exports = router;
