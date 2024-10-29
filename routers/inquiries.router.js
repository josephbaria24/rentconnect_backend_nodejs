// routes/inquiryRoutes.js

const express = require('express');
const router = express.Router();
const inquiryController = require('../controller/inquiries.controller');
const User = require('../models/user.model');
const Inquiry = require('../models/inquiries');

// Create a new inquiry
router.post('/create', inquiryController.createInquiry);

// Get inquiries for a specific user
router.get('/occupant/:userId', inquiryController.getInquiriesByUserId);

// Get inquiries for rooms associated with a landlord
router.get('/landlord/:ownerId', inquiryController.getInquiriesByRoomOwner);

// Update inquiry status
router.patch('/update/:inquiryId', inquiryController.updateInquiryAndApprove);
// Get inquiries for a specific property
router.get('/properties/:propertyId/inquiries', inquiryController.getInquiriesByPropertyId);
router.get('/rooms/:roomId', inquiryController.getInquiriesByRoomId);
router.get('/check-pending', inquiryController.checkInquiry);
router.delete('/delete/:inquiryId', inquiryController.deleteInquiry);
router.put('/mark-as-occupied/:roomId', inquiryController.markRoomAsOccupied);
router.patch('/reject/:inquiryId', inquiryController.rejectInquiry);
router.get('/room/:roomId/property', inquiryController.getPropertyByRoomId);
// New route for moving out inquiry
router.post('/move-out', inquiryController.moveOutInquiry);


// Add a room bill to a specific inquiry
router.post('/:inquiryId/add', inquiryController.addRoomBill);

// Update a specific room bill
router.patch('/:inquiryId/update/:billId', inquiryController.updateRoomBill);

// Delete a specific room bill
router.delete('/bill/delete/:billId', inquiryController.deleteRoomBill);

// Add a room repair request to a specific inquiry
router.post('/:inquiryId/add', inquiryController.addRoomRepair);

// Update a specific room repair request
router.patch('/:inquiryId/update/:repairId', inquiryController.updateRoomRepair);

// Delete a specific room repair request
router.delete('/:inquiryId/delete/:repairId', inquiryController.deleteRoomRepair);


router.patch('/bills/:billId/isPaid', inquiryController.updateRoomBillIsPaid);



// Endpoint to get bills for the current month
router.get('/bills/current-month/:inquiryId', async (req, res) => {
    const { inquiryId } = req.params;
  
    try {
      // Get the current year and month
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-based month
  
      // Find the inquiry by ID and populate necessary fields
      const inquiry = await Inquiry.findById(inquiryId).select('roomBills');
  
      if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found' });
      }
  
      // Filter bills for the current month
      const billsForCurrentMonth = inquiry.roomBills.filter(bill => {
        const billDate = new Date(bill.dueDate);
        return billDate.getFullYear() === year && billDate.getMonth() === month;
      });
  
      // Return the bills if found
      return res.status(200).json(billsForCurrentMonth);
    } catch (error) {
      console.error('Error fetching bills:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });





// Endpoint to get all bills for a specific inquiry
router.get('/bills/:inquiryId', async (req, res) => {
    const { inquiryId } = req.params;
  
    try {
      // Find the inquiry by ID and populate necessary fields
      const inquiry = await Inquiry.findById(inquiryId).select('roomBills');
  
      if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found' });
      }
  
      // Get all room bills
      const allBills = inquiry.roomBills;
  
      // Optional: Filtering by month and year
      const { month, year } = req.query; // e.g., month=9&year=2024
  
      let filteredBills = allBills;
  
      // Filter if month and year are provided
      if (month && year) {
        const targetMonth = parseInt(month, 10) - 1; // Convert to 0-based index
        filteredBills = allBills.filter(bill => {
          const billDate = new Date(bill.dueDate);
          return billDate.getFullYear() === parseInt(year, 10) && billDate.getMonth() === targetMonth;
        });
      }
  
      // Return the bills
      return res.status(200).json(filteredBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });







// Endpoint to get all bills arranged by month of created_at
router.get('/bills/getAll/monthly', async (req, res) => {
    try {
      const inquiries = await Inquiry.find().select('roomBills');
  
      const billsByMonth = {};
  
      inquiries.forEach(inquiry => {
        inquiry.roomBills.forEach(bill => {
          // Extracting created_at date from the electricity bill
          const createdAtElectricity = new Date(bill.electricity.created_at);
          const createdAtWater = new Date(bill.water.created_at);
          const createdAtMaintenance = new Date(bill.maintenance.created_at);
          const createdAtInternet = new Date(bill.internet.created_at);
  
          // Use the created_at date of the electricity bill as a default
          let createdAt = createdAtElectricity;
  
          // Check if createdAt is valid, else fallback to the other utilities
          if (isNaN(createdAt.getTime())) createdAt = createdAtWater;
          if (isNaN(createdAt.getTime())) createdAt = createdAtMaintenance;
          if (isNaN(createdAt.getTime())) createdAt = createdAtInternet;
  
          // After getting a valid date, extract month and year
          const month = createdAt.getMonth() + 1; // Month is 0-based
          const year = createdAt.getFullYear();
  
          // Create a key for the month and year
          const key = `${year}-${month < 10 ? '0' : ''}${month}`; // Format as YYYY-MM
  
          // Initialize array for bills if it doesn't exist
          if (!billsByMonth[key]) {
            billsByMonth[key] = [];
          }
  
          // Push the bill data without unwanted properties
          billsByMonth[key].push({
            electricity: bill.electricity,
            water: bill.water,
            maintenance: bill.maintenance,
            internet: bill.internet,
            dueDate: bill.dueDate, // Assuming dueDate is stored as a Date object
            inquiryId: inquiry._id, // Include inquiry ID for reference
          });
        });
      });
  
      // Format the result into an array
      const result = Object.keys(billsByMonth).map(monthKey => ({
        month: monthKey,
        bills: billsByMonth[monthKey],
      }));
  
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching bills by month:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  






// Endpoint to get a specific bill by its ID
router.get('/bills/getBillId/:billId', async (req, res) => {
    const { billId } = req.params;

    // Check if billId is a valid ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(billId)) {
        return res.status(400).json({ message: 'Invalid billId format' });
    }

    try {
        // Find the inquiry that contains the billId
        const inquiries = await Inquiry.find({ "roomBills._id": billId }).select('roomBills');

        // Check if any inquiry has the bill
        if (!inquiries || inquiries.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Extract the bill from the inquiries
        let bill = null;
        for (const inquiry of inquiries) {
            const foundBill = inquiry.roomBills.id(billId); // Finds the subdocument by its id
            if (foundBill) {
                bill = foundBill;
                break; // Exit once we find the bill
            }
        }

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Return the bill details
        return res.status(200).json(bill);
    } catch (error) {
        console.error('Error fetching bill:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});




router.get('/:inquiryId/email', async (req, res) => {
    try {
        const inquiryId = req.params.inquiryId;

        // Find the inquiry by inquiryId
        const inquiry = await Inquiry.findById(inquiryId).populate('userId', 'email');

        if (!inquiry || !inquiry.userId) {
            return res.status(404).json({ message: 'Inquiry or occupant not found' });
        }

        return res.status(200).json({ email: inquiry.userId.email });
    } catch (error) {
        console.error('Error fetching occupant email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:inquiryId', async (req, res) => {
    try {
        const inquiryId = req.params.inquiryId;

        // Find the inquiry by inquiryId and populate user details
        const inquiry = await Inquiry.findById(inquiryId).populate('userId', 'email');

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        // Return inquiry details including userId and requesterEmail (assumed to be inquiry.userId.email)
        return res.status(200).json({
            inquiryId: inquiry._id,
            userId: inquiry.userId._id, // userId
            requesterEmail: inquiry.userId.email, // Occupant email
            roomNumber: inquiry.roomNumber, // Assuming room number exists in your model
            status: inquiry.status
        });
    } catch (error) {
        console.error('Error fetching inquiry details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/email/:userEmail/inquiries', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;

        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user._id;

        // Find inquiries associated with the found userId
        const inquiries = await Inquiry.find({ userId }).populate('roomId');

        if (!inquiries || inquiries.length === 0) {
            return res.status(404).json({ message: 'No inquiries found for this user' });
        }

        return res.status(200).json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;
