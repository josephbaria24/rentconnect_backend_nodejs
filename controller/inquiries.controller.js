// controllers/inquiryController.js

const inquiryService = require('../services/inquiries.services');
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries')
const RoomServices = require('../services/room.services')
const cron = require('node-cron');
const { calculateRemainingTime } = require('../utils/timeUtils');
const EndedInquiry = require('../models/endedInquiry.model'); // Import the new model
const RentalAgreement = require('../models/rentalAgreemen.model'); // Adjust the path as necessary
const { sendRentalAgreementEmail } = require('../services/emailer.services')
const {ProfileModel} = require('../models/profile.model');
const User = require('../models/user.model');
// Create a new inquiry
const createInquiry = async (req, res) => {
  try {
    const { 
      userId, 
      roomId, 
      requestType, 
      reservationDuration, 
      proposedStartDate, 
      customTerms 
    } = req.body;

    if (!['reservation', 'rent'].includes(requestType)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Validate reservationDuration if requestType is 'reservation'
    if (requestType === 'reservation' && (!reservationDuration || reservationDuration <= 0)) {
      return res.status(400).json({ error: 'Reservation duration is required for reservation inquiries.' });
    }

    const inquiryData = {
      userId,
      roomId,
      requestType,
      status: 'pending',
      proposedStartDate,
      customTerms,
    };

    // Only add reservationDuration if requestType is 'reservation'
    if (requestType === 'reservation') {
      inquiryData.reservationDuration = reservationDuration;
    }

    const inquiry = new Inquiry(inquiryData);
    await inquiry.save();

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const rejectInquiry = async (req, res) => {
  const { inquiryId } = req.params;
  const { reason } = req.body; // Get the rejection reason from the request body

  try {
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Update inquiry status and store the rejection reason
    inquiry.status = 'rejected';
    inquiry.rejectionReason = reason; // Store the rejection reason
    await inquiry.save();

    return res.status(200).json({ message: 'Inquiry rejected successfully', inquiry });
  } catch (error) {
    console.error('Error rejecting inquiry:', error);
    return res.status(500).json({ message: 'Internal server error' });
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


const getInquiriesByUserEmail = async (req, res) => {
  try {
    const inquiries = await inquiryService.getInquiriesByUserId(req.params.userEmail);
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get inquiries for rooms associated with a landlord
const getInquiriesByRoomOwner = async (req, res) => {
  try {
    const inquiries = await inquiryService.getInquiriesByRoomOwner(req.params.ownerId);
    
    console.log("Inquiries retrieved:", inquiries); // Log the inquiries for debugging
    
    res.status(200).json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



const updateInquiryAndApprove = async (req, res) => {
  const { inquiryId } = req.params;
  const { 
    status, 
    requestType, 
    roomId, 
    userId, 
    reservationDuration, 
    proposedStartDate, 
    customTerms 
  } = req.body;

  try {
    const updateData = {
      status: status,
      requestType: requestType,
      approvalDate: new Date(),
      proposedStartDate: proposedStartDate, // Include proposed start date
      customTerms: customTerms // Include custom terms
    };

    // Only update reservationDuration if requestType is 'reservation'
    if (requestType === 'reservation' && reservationDuration) {
      updateData.reservationDuration = reservationDuration;
    }

    // Set isRented to true if the request type is 'rent' and status is approved
    if (requestType === 'rent' && status === 'approved') {
      updateData.isRented = true;
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      updateData,
      { new: true }
    );

    if (!updatedInquiry) {
      return res.status(404).send('Inquiry not found');
    }

    let roomUpdateData = { roomStatus: '' };

    if (requestType === 'reservation' && status === 'approved') {
      roomUpdateData.roomStatus = 'reserved';
      roomUpdateData.reservedDate = new Date();
      roomUpdateData.$addToSet = { reservationInquirers: userId };
    } else if (requestType === 'rent' && status === 'approved') {
      roomUpdateData.roomStatus = 'occupied';
      roomUpdateData.rentedDate = new Date();
      roomUpdateData.$addToSet = { occupantUsers: userId };

      // Fetch room details to create a rental agreement
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Create the rental agreement
      const newAgreement = new RentalAgreement({
        occupantId: userId,
        landlordId: room.ownerId, // Use ownerId instead of landlordId
        roomId,
        monthlyRent: room.price,
        securityDeposit: room.deposit,
        leaseStartDate: new Date(),
        leaseEndDate: null,
        terms: customTerms || 'Standard rental agreement terms',  // Use customTerms if provided
        status: 'active'
      });

      // Save the rental agreement
      await newAgreement.save();

      // Fetch landlord's profile using their userId
      const landlordProfile = await ProfileModel.findOne({ userId: room.ownerId }); // Use ownerId to find the landlord's profile
      if (!landlordProfile) {
        return res.status(404).json({ message: 'Landlord profile not found' });
      }

      // Fetch occupant's profile using their userId
      const occupantProfile = await ProfileModel.findOne({ userId: userId });
      if (!occupantProfile) {
        return res.status(404).json({ message: 'Occupant profile not found' });
      }

      // Fetch landlord's email from User model
      const landlordUser = await User.findById(room.ownerId); // Fetch landlord user
      if (!landlordUser || !landlordUser.email) {
        return res.status(404).json({ message: 'Landlord user not found or email not available' });
      }

      // Fetch occupant's email from User model
      const occupantUser = await User.findById(userId); // Fetch occupant user
      if (!occupantUser || !occupantUser.email) {
        return res.status(404).json({ message: 'Occupant user not found or email not available' });
      }

      // Create email content using first and last names
      const landlordFullName = `${landlordProfile.firstName} ${landlordProfile.lastName}`;
      const occupantFullName = `${occupantProfile.firstName} ${occupantProfile.lastName}`;

      // Create contact details objects
      const landlordContactDetails = {
        phone: landlordProfile.contactDetails.phone,
        address: landlordProfile.contactDetails.address
      };

      const occupantContactDetails = {
        phone: occupantProfile.contactDetails.phone,
        address: occupantProfile.contactDetails.address
      };

      // Send rental agreement email to landlord and occupant
      sendRentalAgreementEmail(
        landlordUser.email,   // Use landlord's email from User model
        landlordFullName,
        landlordContactDetails,
        occupantUser.email,   // Use occupant's email from User model
        occupantFullName,
        occupantContactDetails,
        newAgreement,
        (error, response) => {
          if (error) {
            console.error('Error sending rental agreement email:', error);
          } else {
            console.log('Rental agreement email sent successfully:', response);
          }
        }
      );
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, roomUpdateData, { new: true });

    if (!updatedRoom) {
      return res.status(404).send('Room not found');
    }

    res.status(200).json({ inquiry: updatedInquiry, room: updatedRoom });
  } catch (error) {
    console.error("Error updating inquiry and room:", error);
    res.status(500).send('Server error');
  }
};

// const updateInquiryAndApprove = async (req, res) => {
//   const { inquiryId } = req.params;
//   const { 
//     status, 
//     requestType, 
//     roomId, 
//     userId, 
//     reservationDuration, 
//     proposedStartDate, 
//     customTerms 
//   } = req.body;

//   try {
//     const updateData = {
//       status: status,
//       requestType: requestType,
//       approvalDate: new Date(),
//       proposedStartDate: proposedStartDate, // Include proposed start date
//       customTerms: customTerms // Include custom terms
//     };

//     // Only update reservationDuration if requestType is 'reservation'
//     if (requestType === 'reservation' && reservationDuration) {
//       updateData.reservationDuration = reservationDuration;
//     }

//     // Set isRented to true if the request type is 'rent' and status is approved
//     if (requestType === 'rent' && status === 'approved') {
//       updateData.isRented = true;
//     }

//     const updatedInquiry = await Inquiry.findByIdAndUpdate(
//       inquiryId,
//       updateData,
//       { new: true }
//     );

//     if (!updatedInquiry) {
//       return res.status(404).send('Inquiry not found');
//     }

//     let roomUpdateData = { roomStatus: '' };

//     if (requestType === 'reservation' && status === 'approved') {
//       roomUpdateData.roomStatus = 'reserved';
//       roomUpdateData.reservedDate = new Date();
//       roomUpdateData.$addToSet = { reservationInquirers: userId };
//     } else if (requestType === 'rent' && status === 'approved') {
//       roomUpdateData.roomStatus = 'occupied';
//       roomUpdateData.rentedDate = new Date();
//       roomUpdateData.$addToSet = { occupantUsers: userId };
//     }

//     const updatedRoom = await Room.findByIdAndUpdate(roomId, roomUpdateData, { new: true });

//     if (!updatedRoom) {
//       return res.status(404).send('Room not found');
//     }

//     res.status(200).json({ inquiry: updatedInquiry, room: updatedRoom });
//   } catch (error) {
//     console.error("Error updating inquiry and room:", error);
//     res.status(500).send('Server error');
//   }
// };


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


const checkInquiry = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    // Find if there are any inquiries for this user with pending or approved status
    const existingInquiry = await Inquiry.findOne({
      userId,
      status: { $in: ['pending', 'approved'] } // Check for pending or approved inquiries
    });

    // If an inquiry exists (pending or approved), the user cannot inquire about any other rooms
    if (existingInquiry) {
      return res.json({ canInquire: false, status: existingInquiry.status });
    } else {
      return res.json({ canInquire: true });
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

const markRoomAsOccupied = async (req, res) => {
  const { roomId } = req.params;

  try {
    // Find the inquiry that has the roomId, is approved, and is of type 'reservation'
    const inquiry = await Inquiry.findOne({ roomId, status: 'approved', requestType: 'reservation' });
    
    if (!inquiry) {
      return res.status(404).json({ error: 'No approved reservation found for this room.' });
    }

    // Find the room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Check if there are any reservationInquirers
    if (!room.reservationInquirers || room.reservationInquirers.length === 0) {
      return res.status(400).json({ error: 'No reservation inquirers found for this room.' });
    }

    // Move the first user from reservationInquirers to occupantUsers
    const occupantUserId = room.reservationInquirers[0];

    // Update the room: add the user to occupantUsers and remove from reservationInquirers
    const updatedRoom = await Room.findByIdAndUpdate(roomId, {
      roomStatus: 'occupied',
      $addToSet: { occupantUsers: occupantUserId },
      $pull: { reservationInquirers: occupantUserId }
    }, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Update the inquiry: set status to 'occupied', isRented to true, and moveInDate to the current date
    console.log('Updating inquiry:', inquiry._id); // Log inquiry ID before update
    const updatedInquiry = await Inquiry.findByIdAndUpdate(inquiry._id, {
      status: 'occupied',
      isRented: true,
      moveInDate: new Date() // Set moveInDate to the current date
    }, { new: true }); // Return updated document

    console.log('Updated Inquiry:', updatedInquiry); // Log updated inquiry

    res.status(200).json({ message: 'Room marked as occupied, user added to occupantUsers, and inquiry updated.', room: updatedRoom });
  } catch (error) {
    console.error('Error marking room as occupied:', error);
    res.status(500).json({ error: error.message });
  }
};




cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  
  try {
    // Fetch inquiries that are not rented and have exceeded their reservation duration
    const inquiriesToReject = await Inquiry.find({
      isRented: false,
      status: 'approved', // Only check approved inquiries
      approvalDate: { $lt: new Date(now.getTime() - reservationDuration * 24 * 60 * 60 * 1000) } // Check if duration has passed
    });

    // Update the status of these inquiries to 'rejected'
    for (const inquiry of inquiriesToReject) {
      inquiry.status = 'rejected';
      await inquiry.save();
    }
    
    console.log('Rejected inquiries:', inquiriesToReject.length);
  } catch (error) {
    console.error('Error rejecting inquiries:', error);
  }
});

const rejectLapsedInquiries = async () => {
  try {
    const currentDate = new Date();

    // Find all inquiries that have been approved
    const inquiriesToReject = await Inquiry.find({
      status: 'approved',
      approvalDate: { $exists: true }, // Ensure there is an approval date
      reservationDuration: { $exists: true }, // Ensure there is a reservation duration
    });

    for (const inquiry of inquiriesToReject) {
      const approvalDate = new Date(inquiry.approvalDate); // Use approval date
      const endDate = new Date(approvalDate); // Set end date based on approval date
      endDate.setDate(endDate.getDate() + inquiry.reservationDuration); // Add duration to end date

      // Check if the current date has exceeded the end date
      if (currentDate > endDate) {
        inquiry.status = 'rejected'; // Update status to rejected
        await inquiry.save(); // Save the updated inquiry
        console.log(`Inquiry ${inquiry._id} has been rejected due to lapsed duration.`);
      }
    }
  } catch (error) {
    console.error('Error rejecting lapsed inquiries:', error);
  }
};


const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user.id });

    const inquiriesWithRemainingTime = inquiries.map(inquiry => {
      const remainingTime = calculateRemainingTime(inquiry.approvalDate, inquiry.reservationDuration);
      return {
        ...inquiry._doc, // spread the inquiry fields
        remainingTime // add remaining time
      };
    });

    res.status(200).json(inquiriesWithRemainingTime);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).send('Server error');
  }
};

const getPropertyByRoomId = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Find the room using the roomId and populate the propertyId
    const room = await Room.findById(roomId).populate('propertyId');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Return the populated property details
    return res.status(200).json(room.propertyId);
  } catch (error) {
    console.error('Error fetching property by roomId:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




const addRoomBill = async (req, res) => {
  const { inquiryId } = req.params;
  const { electricity, water, maintenance, internet, dueDate, isPaid } = req.body; // Add isPaid to the body

  try {
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Parse dueDate to remove hours for comparison
    const normalizedDueDate = new Date(dueDate);
    normalizedDueDate.setHours(0, 0, 0, 0); // Remove hours for accurate monthly check

    // Check if a bill for the same month and year already exists
    const existingBill = inquiry.roomBills.find(bill => {
      const billDueDate = new Date(bill.dueDate);
      billDueDate.setHours(0, 0, 0, 0); // Normalize bill dueDate for comparison

      return (
        billDueDate.getFullYear() === normalizedDueDate.getFullYear() &&
        billDueDate.getMonth() === normalizedDueDate.getMonth()
      );
    });

    if (existingBill) {
      // If the bill for the same month exists, prompt the user to view it instead
      return res.status(409).json({
        message: 'A bill for this month already exists. Do you want to view it?',
        billId: existingBill._id
      });
    }

    // Create a new bill
    const billData = {
      dueDate: dueDate || null,
      isPaid: isPaid || false, // Default to false if not provided at the top level
      created_at: Date.now(),
      updated_at: Date.now(),
      electricity: {
        amount: electricity?.amount || null, // Allow null if not provided
        paymentDate: electricity?.paymentDate || null,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      water: {
        amount: water?.amount || null, // Allow null if not provided
        paymentDate: water?.paymentDate || null,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      maintenance: {
        amount: maintenance?.amount || null, // Allow null if not provided
        paymentDate: maintenance?.paymentDate || null,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      internet: {
        amount: internet?.amount || null, // Allow null if not provided
        paymentDate: internet?.paymentDate || null,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    };

    // Add new bill to roomBills
    inquiry.roomBills.push(billData);
    await inquiry.save();

    res.status(201).json({ message: 'Room bill added successfully', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Update isPaid status of a room bill using only billId
const updateRoomBillIsPaid = async (req, res) => {
  const { billId } = req.params;
  const { isPaid } = req.body; // New isPaid status passed in request body

  try {
    // Find the inquiry containing the room bill with the given billId
    const inquiry = await Inquiry.findOne({ "roomBills._id": billId });

    if (!inquiry) {
      return res.status(404).json({ message: 'Room bill not found' });
    }

    // Find the specific room bill within the inquiry
    const roomBill = inquiry.roomBills.id(billId);

    if (!roomBill) {
      return res.status(404).json({ message: 'Room bill not found' });
    }

    // Update the isPaid status
    roomBill.isPaid = isPaid;
    roomBill.updated_at = Date.now(); // Update the timestamp

    await inquiry.save();

    res.status(200).json({ message: 'Room bill payment status updated successfully', roomBill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const updateRoomBill = async (req, res) => {
  const { inquiryId, billId } = req.params;
  const { electricity, water, maintenance, internet } = req.body; // Assuming these are provided as objects with the necessary fields

  try {
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const bill = inquiry.roomBills.id(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Update electricity bill
    if (electricity) {
      if (electricity.amount !== undefined) bill.electricity.amount = electricity.amount;
      if (electricity.dueDate) bill.electricity.dueDate = electricity.dueDate;
      if (electricity.isPaid !== undefined) bill.electricity.isPaid = electricity.isPaid;
      if (electricity.paymentDate) bill.electricity.paymentDate = electricity.paymentDate;
      bill.electricity.updated_at = Date.now(); // Update timestamp
    }

    // Update water bill
    if (water) {
      if (water.amount !== undefined) bill.water.amount = water.amount;
      if (water.dueDate) bill.water.dueDate = water.dueDate;
      if (water.isPaid !== undefined) bill.water.isPaid = water.isPaid;
      if (water.paymentDate) bill.water.paymentDate = water.paymentDate;
      bill.water.updated_at = Date.now(); // Update timestamp
    }

    // Update maintenance bill
    if (maintenance) {
      if (maintenance.amount !== undefined) bill.maintenance.amount = maintenance.amount;
      if (maintenance.dueDate) bill.maintenance.dueDate = maintenance.dueDate;
      if (maintenance.isPaid !== undefined) bill.maintenance.isPaid = maintenance.isPaid;
      if (maintenance.paymentDate) bill.maintenance.paymentDate = maintenance.paymentDate;
      bill.maintenance.updated_at = Date.now(); // Update timestamp
    }

    // Update internet bill
    if (internet) {
      if (internet.amount !== undefined) bill.internet.amount = internet.amount;
      if (internet.dueDate) bill.internet.dueDate = internet.dueDate;
      if (internet.isPaid !== undefined) bill.internet.isPaid = internet.isPaid;
      if (internet.paymentDate) bill.internet.paymentDate = internet.paymentDate;
      bill.internet.updated_at = Date.now(); // Update timestamp
    }

    await inquiry.save();

    res.status(200).json({ message: 'Room bill updated successfully', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







const deleteRoomBill = async (req, res) => {
  const { billId } = req.params;

  try {
    // Use MongoDB updateOne to pull the bill from the roomBills array
    const result = await Inquiry.updateOne(
      { 'roomBills._id': billId }, // Query to find the inquiry containing the bill
      { $pull: { roomBills: { _id: billId } } } // Pull the specific bill from the array
    );

    // Check if a document was modified
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Bill not found or no changes made' });
    }

    res.status(200).json({ message: 'Room bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





const addRoomRepair = async (req, res) => {
  const { inquiryId } = req.params;
  const { repairType, description } = req.body;

  try {
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const repairData = {
      repairType,
      description
    };

    inquiry.roomRepairs.push(repairData);
    await inquiry.save();

    res.status(201).json({ message: 'Room repair request added successfully', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRoomRepair = async (req, res) => {
  const { inquiryId, repairId } = req.params;
  const { repairType, description, status, completionDate } = req.body;

  try {
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const repair = inquiry.roomRepairs.id(repairId);
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    if (repairType) repair.repairType = repairType;
    if (description) repair.description = description;
    if (status) repair.status = status;
    if (completionDate) repair.completionDate = completionDate;

    await inquiry.save();

    res.status(200).json({ message: 'Room repair request updated successfully', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoomRepair = async (req, res) => {
  const { inquiryId, repairId } = req.params;

  try {
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const repair = inquiry.roomRepairs.id(repairId);
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    repair.remove();
    await inquiry.save();

    res.status(200).json({ message: 'Room repair request deleted successfully', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const moveOutInquiry = async (req, res) => {
  try {
    const { userId, roomId, moveOutDate } = req.body;

    // Validate input
    if (!userId || !roomId || !moveOutDate) {
      return res.status(400).json({ error: 'User ID, Room ID, and Move Out Date are required.' });
    }

    // Find the inquiry to move out
    const inquiry = await Inquiry.findOne({ userId, roomId, status: 'pending' });
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    // Create a new ended inquiry record
    const endedInquiryData = {
      userId,
      roomId,
      requestType: inquiry.requestType,
      moveOutDate,
    };

    const endedInquiry = new EndedInquiry(endedInquiryData);
    await endedInquiry.save();

    // Optionally delete the inquiry from the inquiries collection
    await Inquiry.deleteOne({ _id: inquiry._id });

    res.status(200).json({ message: 'Inquiry moved out successfully.', endedInquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
 
  deleteInquiry,
  checkInquiry,
  getInquiriesByRoomId,
  createInquiry,
  getInquiriesByUserId,
  getInquiriesByRoomOwner,
  updateInquiryAndApprove,
  getInquiriesByPropertyId, 
  markRoomAsOccupied,
  rejectLapsedInquiries,
  getInquiries,
  rejectInquiry,
  getInquiriesByUserEmail,
  getPropertyByRoomId,
  addRoomBill,
  updateRoomBill,
  deleteRoomBill,
  addRoomRepair,
  updateRoomRepair,
  deleteRoomRepair,
  updateRoomBillIsPaid,
  moveOutInquiry,

};