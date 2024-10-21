const express = require('express');
const router = express.Router();
const RoomController = require('../controller/rooms.controller');
const upload = require('../multerConfig'); // Import multer configuration
const Room = require('../models/room.model')
const Inquiry = require('../models/inquiries');
const User = require('../models/user.model');
const RentalAgreement = require('../models/rentalAgreemen.model'); // Adjust the path as necessary
const { sendRentalAgreementEmail } = require('../services/emailer.services')
const {ProfileModel} = require('../models/profile.model')
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



router.put('/:id/due-date', async (req, res) => {
  try {
    let { dueDate } = req.body;
    const roomId = req.params.id;

    // Convert the incoming date string to a Date object
    let date = new Date(dueDate);

    // Set time to midnight (UTC) to avoid timezone shifts
    date.setUTCHours(0, 0, 0, 0);

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { dueDate: date.toISOString() }, // Save date as UTC midnight
      { new: true } // Return the updated room
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Due date updated successfully', updatedRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error updating due date', error });
  }
});



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

    // Update the inquiry to set moveInDate and mark as rented
    await Inquiry.updateOne(
      { roomId: roomId, userId: userId, requestType: 'reservation' },
      {
        moveInDate: new Date(),
        status: 'approved',
        isRented: true
      }
    );
    await Inquiry.updateOne(
      { roomId: roomId, userId: userId, requestType: 'rent' },
      {
        moveInDate: new Date(),
        status: 'approved',
        isRented: true
      }
    );

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
      terms: 'Standard rental agreement terms',
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

    return res.status(200).json({
      message: 'Room marked as occupied, inquiry updated to rented, and rental agreement created',
      agreement: newAgreement
    });
  } catch (error) {
    console.error('Error marking room as occupied:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// // Route to mark room as occupied
// router.patch('/:roomId/occupy', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId } = req.body;

//   try {
//     // Update the room status, add the userId to occupantUsers, and remove userId from reservationInquirers
//     await Room.updateOne(
//       { _id: roomId },
//       {
//         roomStatus: 'occupied',
//         $addToSet: { occupantUsers: userId },
//         $pull: { reservationInquirers: userId } // Remove userId from reservationInquirers
//       }
//     );

//     // Update the inquiry to set moveInDate and mark as rented
//     await Inquiry.updateOne(
//       { roomId: roomId, userId: userId, requestType: 'reservation' },
//       {
//         moveInDate: new Date(),
//         status: 'approved',
//         isRented: true
//       }
//     );

//     // Fetch room details to create a rental agreement
//     const room = await Room.findById(roomId);
//     if (!room) {
//       return res.status(404).json({ message: 'Room not found' });
//     }

//     // Create the rental agreement
//     const newAgreement = new RentalAgreement({
//       occupantId: userId,
//       landlordId: room.ownerId, // Use ownerId instead of landlordId
//       roomId,
//       monthlyRent: room.price,
//       securityDeposit: room.deposit,
//       leaseStartDate: new Date(),
//       leaseEndDate: null,
//       terms: 'Standard rental agreement terms',
//       status: 'active'
//     });

//     // Save the rental agreement
//     await newAgreement.save();

//     // Fetch landlord's email using ownerId
//     const landlord = await User.findById(room.ownerId); // Use ownerId to find the landlord
//     if (!landlord) {
//       return res.status(404).json({ message: 'Landlord not found' });
//     }

//     // Fetch occupant's email
//     const occupant = await User.findById(userId);
//     if (!occupant) {
//       return res.status(404).json({ message: 'Occupant not found' });
//     }

//     // Send rental agreement email to landlord
//     sendRentalAgreementEmail(landlord.email, occupant.email, newAgreement, (error, response) => {
//       if (error) {
//         console.error('Error sending rental agreement email:', error);
//       } else {
//         console.log('Rental agreement email sent successfully:', response);
//       }
//     });

//     return res.status(200).json({
//       message: 'Room marked as occupied, inquiry updated to rented, and rental agreement created',
//       agreement: newAgreement
//     });
//   } catch (error) {
//     console.error('Error marking room as occupied:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// });


// router.patch('/:roomId/occupy', async (req, res) => {
//   const { roomId } = req.params;
//   const { userId } = req.body;

//   try {
//       // Update the room status, add the userId to occupantUsers, and remove userId from reservationInquirers
//       await Room.updateOne(
//           { _id: roomId },
//           { 
//               roomStatus: 'occupied', 
//               $addToSet: { occupantUsers: userId },
//               $pull: { reservationInquirers: userId } // Remove userId from reservationInquirers
//           }
//       );

//       // Update the inquiry to set moveInDate and mark as rented
//       const updatedInquiry = await Inquiry.updateOne(
//           { roomId: roomId, userId: userId, requestType: 'reservation' },
//           { 
//               moveInDate: new Date(),
//               status: 'approved',
//               isRented: true
//           }
//       );

//       if (!updatedInquiry.nModified) {
//           return res.status(404).json({ message: 'No inquiry found to update' });
//       }

//       // Fetch room details to create a rental agreement
//       const room = await Room.findById(roomId);

//       if (!room) {
//           return res.status(404).json({ message: 'Room not found' });
//       }

//       // Create the rental agreement
//       const newAgreement = new RentalAgreement({
//           occupantId: userId,
//           landlordId: room.landlordId,
//           roomId,
//           monthlyRent: room.price,
//           securityDeposit: room.deposit,
//           leaseStartDate: new Date(),
//           leaseEndDate: null,
//           terms: 'Standard rental agreement terms',
//           status: 'active'
//       });

//       // Save the rental agreement
//       await newAgreement.save();

//       // Send rental agreement email to landlord
//       sendRentalAgreementEmail(landlordId.email, User.email, newAgreement, (error, response) => {
//         if (error) {
//             console.error('Error sending rental agreement email:', error);
//         } else {
//             console.log('Rental agreement email sent successfully:', response);
//         }
//     });

//       return res.status(200).json({
//           message: 'Room marked as occupied, inquiry updated to rented, and rental agreement created',
//           agreement: newAgreement
//       });
//   } catch (error) {
//       console.error('Error marking room as occupied:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//   }
// });




router.get('/landlord-email/:roomId', async (req, res) => {
  try {
      const room = await Room.findById(req.params.roomId).populate('ownerId');
      
      if (!room) {
          return res.status(404).json({ message: 'Room not found' });
      }

      const landlordEmail = room.ownerId.email; // Get the landlord's email
      return res.status(200).json({ landlordEmail });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
});

  

module.exports = router;