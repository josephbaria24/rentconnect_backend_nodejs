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
    
    console.log("Inquiries retrieved:", inquiries); // Log the inquiries for debugging
    
    res.status(200).json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// const updateInquiryAndRoom = async (req, res) => {
//   const { inquiryId } = req.params;
//   const { status, requestType, roomId, userId } = req.body;

//   try {
//       // Log incoming request data
//       console.log('Incoming request data:', req.body);

//       // Update the inquiry status
//       const updatedInquiry = await Inquiry.findByIdAndUpdate(inquiryId, {
//           status: status,
//           requestType: requestType,
//           roomId: roomId,
//           userId: userId
//       }, { new: true });

//       // Log updated inquiry
//       console.log('Updated Inquiry:', updatedInquiry);

//       if (!updatedInquiry) {
//           return res.status(404).send('Inquiry not found');
//       }

//       // Prepare room update data
//       let roomUpdateData = {
//           roomStatus: '',
//           $addToSet: { occupantUsers: userId }, // Add userId to occupantUsers
//       };

//       // Check the requestType and status to set the appropriate room status and date
//       if (requestType === 'reservation' && status === 'approved') {
//           roomUpdateData.roomStatus = 'reserved';
//           roomUpdateData.reservedDate = new Date(); // Set the reserved date to the current date
//       } else if (requestType === 'rent' && status === 'approved') {
//           roomUpdateData.roomStatus = 'occupied';
//           roomUpdateData.rentedDate = new Date(); // Set the rented date to the current date
//       }

//       // Ensure the room status and dates are updated after the inquiry update
//       const updatedRoom = await Room.findByIdAndUpdate(roomId, roomUpdateData, { new: true });

//       // Log updated room
//       console.log('Updated Room:', updatedRoom);

//       if (!updatedRoom) {
//           return res.status(404).send('Room not found');
//       }

//       // Return the updated inquiry and room
//       res.status(200).json({ inquiry: updatedInquiry, room: updatedRoom });
//   } catch (error) {
//       console.error('Error updating inquiry and room:', error);
//       res.status(500).send('Server error');
//   }
// };
const updateInquiryAndRoom = async (req, res) => {
  const { inquiryId } = req.params;
  const { status, requestType, roomId, userId } = req.body;

  try {
    console.log('Incoming request data:', req.body);

    // Update the inquiry status
    const updatedInquiry = await Inquiry.findByIdAndUpdate(inquiryId, {
      status: status,
      requestType: requestType,
      roomId: roomId,
      userId: userId
    }, { new: true });

    console.log('Updated Inquiry:', updatedInquiry);

    if (!updatedInquiry) {
      return res.status(404).send('Inquiry not found');
    }

    // Prepare room update data
    let roomUpdateData = {
      roomStatus: '',
    };

    // Modify logic based on requestType and status
    if (requestType === 'reservation' && status === 'approved') {
      roomUpdateData.roomStatus = 'reserved';
      roomUpdateData.reservedDate = new Date(); // Set the reserved date
      roomUpdateData.$addToSet = { reservationInquirers: userId }; // Add to reservationInquirers
    } else if (requestType === 'rent' && status === 'approved') {
      roomUpdateData.roomStatus = 'occupied';
      roomUpdateData.rentedDate = new Date(); // Set the rented date
      roomUpdateData.$addToSet = { occupantUsers: userId }; // Add to occupantUsers
    }

    // Ensure the room status and dates are updated after the inquiry update
    const updatedRoom = await Room.findByIdAndUpdate(roomId, roomUpdateData, { new: true });

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

const markRoomAsOccupied = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body; // this should be the ID of the occupant

  try {
      // Find the inquiry that has the roomId and is in reservationInquirers
      const inquiry = await Inquiry.findOne({ roomId, status: 'approved' });
      
      if (!inquiry || inquiry.requestType !== 'reservation') {
          return res.status(404).json({ error: 'No approved reservation found for this room.' });
      }

      // Update the inquiry to reflect that the occupant has moved in
      await Inquiry.findByIdAndUpdate(inquiry._id, { status: 'occupied' });

      // Update the room status and add the occupant to occupantUsers
      const updatedRoom = await Room.findByIdAndUpdate(roomId, {
          roomStatus: 'occupied',
          $addToSet: { occupantUsers: inquiry.userId } // Add the occupant userId
      }, { new: true });

      if (!updatedRoom) {
          return res.status(404).json({ error: 'Room not found.' });
      }

      res.status(200).json({ message: 'Room marked as occupied and user added to occupantUsers.', room: updatedRoom });
  } catch (error) {
      console.error('Error marking room as occupied:', error);
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
  getInquiriesByPropertyId, 
  markRoomAsOccupied,// Add this line
};