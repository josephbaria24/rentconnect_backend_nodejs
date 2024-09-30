const RoomServices = require('../services/room.services');
const upload = require('../multerConfig');
const RoomModel = require('../models/room.model');


exports.createRoom = async (req, res, next) => {
    try {
        console.log("Request files:", req.files);
        console.log("Request body:", req.body);

        const rooms = req.body.rooms || []; // Get the rooms array from the request body
        const processedRooms = [];

        rooms.forEach((room, index) => {
            const roomData = {
                propertyId: room.propertyId,
                roomNumber: room.roomNumber,
                price: room.price,
                capacity: room.capacity,
                deposit: room.deposit,
                advance: room.advance,
                roomStatus: room.roomStatus,
                dueDate: room.dueDate,
                reservationDuration: room.reservationDuration,
                reservationFee: room.reservationFee,
                
            };

            // Attach the corresponding photos
            roomData.photo1 = req.files.find(file => file.fieldname === `rooms[${index}][photo1]`)?.path || null;
            roomData.photo2 = req.files.find(file => file.fieldname === `rooms[${index}][photo2]`)?.path || null;
            roomData.photo3 = req.files.find(file => file.fieldname === `rooms[${index}][photo3]`)?.path || null;
            console.log(`Room ${index} data:`, roomData); // Log the room data to debug

            // Ensure all required fields are present
            if (!roomData.propertyId || !roomData.roomNumber || !roomData.photo1 || !roomData.price || !roomData.capacity ||
                !roomData.deposit || !roomData.advance || !roomData.reservationDuration || !roomData.reservationFee) {
                throw new Error(`Missing required fields for room ${index}`);
            }

            processedRooms.push(roomData);
        });

        console.log("Processed rooms data:", processedRooms);

        // Save all rooms using RoomServices
        const savedRooms = await RoomServices.createMultipleRooms(processedRooms); // Ensure this method handles multiple rooms
        res.json({ status: true, success: savedRooms });
    } catch (error) {
        console.error("Error creating rooms:", error);
        res.status(400).send({ error: error.message });
    }
};




exports.getRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const room = await RoomServices.getRoom(id);
        if (!room) {
            return res.status(404).json({ status: false, error: 'Room not found' });
        }
        res.json({ status: true, room });
    } catch (error) {
        next(error);
    }
};

exports.updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if the roomStatus is being updated to 'reserved' or 'rented'
        if (updateData.roomStatus === 'reserved') {
            updateData.reservedDate = new Date(); // Set reserved date to current date
        } else if (updateData.roomStatus === 'rented') {
            updateData.rentedDate = new Date(); // Set rented date to current date
        }

        const updatedRoom = await RoomServices.updateRoom(id, updateData);
        if (!updatedRoom) {
            return res.status(404).json({ status: false, error: 'Room not found' });
        }
        res.json({ status: true, room: updatedRoom });
    } catch (error) {
        next(error);
    }
};


// exports.updateRoom = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;
//         const updatedRoom = await RoomServices.updateRoom(id, updateData);
//         if (!updatedRoom) {
//             return res.status(404).json({ status: false, error: 'Room not found' });
//         }
//         res.json({ status: true, room: updatedRoom });
//     } catch (error) {
//         next(error);
//     }
// };

exports.deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedRoom = await RoomServices.deleteRoom(id);
        if (!deletedRoom) {
            return res.status(404).json({ status: false, error: 'Room not found' });
        }
        res.json({ status: true, message: 'Room deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.addUserToRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        const updatedRoom = await RoomServices.addUserToRoom(roomId, userId);
        await 
        res.status(200).json({ status: true, room: updatedRoom });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.addNonUserToRoom = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const occupantData = req.body.occupant;
        const room = await RoomServices.addNonUserToRoom(roomId, occupantData);
        res.json({ status: true, success: room });
    } catch (error) {
        next(error);
    }
};

exports.getRoomsByPropertyId = async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const rooms = await RoomServices.getRoomsByPropertyId(propertyId);

        if (rooms.length === 0) {
            return res.status(404).json({ status: false, message: 'No rooms found for this property' });
        }

        res.json({ status: true, rooms });
    } catch (error) {
        next(error);
    }
};

exports.reserveRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        // Check if the room is available
        const room = await RoomModel.findById(roomId);
        if (!room || room.roomStatus !== 'available') {
            return res.status(400).json({ status: false, error: 'Room is not available for reservation' });
        }

        // Create reservation request
        const reservation = new ReservationModel({
            roomId,
            userId,
            status: 'pending'
        });
        await reservation.save();

        // Add reservation to the room's reservations
        room.reservations.push(reservation._id);
        await room.save();

        // Notify landlord
        const property = await room.populate('propertyId').execPopulate();
        const landlord = property.propertyOwner; // Assume property has a landlord reference
        NotificationService.createNotification(landlord, `A reservation request has been made for room ${room.roomNumber}`);

        res.json({ status: true, reservation });
    } catch (error) {
        console.error('Error reserving room:', error);
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.requestRent = async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        // Check if the room is available
        const room = await RoomModel.findById(roomId);
        if (!room || room.roomStatus !== 'available') {
            return res.status(400).json({ status: false, error: 'Room is not available for rent' });
        }

        // Create rental request
        const rentalRequest = new RentalRequestModel({
            roomId,
            userId,
            status: 'pending'
        });
        await rentalRequest.save();

        // Add rental request to the room's rentalRequests
        room.rentalRequests.push(rentalRequest._id);
        await room.save();

        // Notify landlord
        const property = await room.populate('propertyId').execPopulate();
        const landlord = property.propertyOwner; // Assume property has a landlord reference
        NotificationService.createNotification(landlord, `A rental request has been made for room ${room.roomNumber}`);

        res.json({ status: true, rentalRequest });
    } catch (error) {
        console.error('Error requesting rent:', error);
        res.status(500).json({ status: false, error: error.message });
    }
};


