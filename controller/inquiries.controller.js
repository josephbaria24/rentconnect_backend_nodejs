// controllers/inquiryController.js

const inquiryService = require('../services/inquiries.services');
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries')
const RoomServices = require('../services/room.services')
const cron = require('node-cron');
const { calculateRemainingTime } = require('../utils/timeUtils');
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
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, roomUpdateData, { new: true });

    if (!updatedRoom) {
      return res.status(404).send('Room not found');
    }

    res.status(200).json({ inquiry: updatedInquiry, room: updatedRoom });
  } catch (error) {
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

// const markRoomAsOccupied = async (req, res) => {
//   const { roomId } = req.params;
//   const { userId } = req.body; // this should be the ID of the occupant

//   try {
//       // Find the inquiry that has the roomId and is in reservationInquirers
//       const inquiry = await Inquiry.findOne({ roomId, status: 'approved' });
      
//       if (!inquiry || inquiry.requestType !== 'reservation') {
//           return res.status(404).json({ error: 'No approved reservation found for this room.' });
//       }

//       // Update the inquiry to reflect that the occupant has moved in
//       await Inquiry.findByIdAndUpdate(inquiry._id, { status: 'occupied' });

//       // Update the room status and add the occupant to occupantUsers
//       const updatedRoom = await Room.findByIdAndUpdate(roomId, {
//           roomStatus: 'occupied',
//           $addToSet: { occupantUsers: inquiry.userId } // Add the occupant userId
//       }, { new: true });

//       if (!updatedRoom) {
//           return res.status(404).json({ error: 'Room not found.' });
//       }

//       res.status(200).json({ message: 'Room marked as occupied and user added to occupantUsers.', room: updatedRoom });
//   } catch (error) {
//       console.error('Error marking room as occupied:', error);
//       res.status(500).json({ error: error.message });
//   }
// };

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





module.exports = {
  deleteInquiry,
  checkPendingInquiry,
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
  getPropertyByRoomId

};