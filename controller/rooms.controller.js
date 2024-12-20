const RoomServices = require('../services/room.services');
const upload = require('../multerConfig');
const RoomModel = require('../models/room.model');
const Property = require('../models/properties.model')

exports.createRoom = async (req, res, next) => {
    try {
        console.log("Request files:", req.files);
        console.log("Request body:", req.body);

        const rooms = req.body.rooms || []; // Get the rooms array from the request body
        const processedRooms = [];

        for (let index = 0; index < rooms.length; index++) {
            const room = rooms[index];
            const roomData = {
                propertyId: room.propertyId,
                roomNumber: room.roomNumber,
                price: room.price,
                capacity: room.capacity,
                deposit: room.deposit,
                advance: room.advance,
                roomStatus: room.roomStatus,
                dueDate: room.dueDate ? new Date(room.dueDate) : null,
                reservationFee: room.reservationFee,
            };

            // Attach the corresponding photos
            roomData.photo1 = req.files.find(file => file.fieldname === `rooms[${index}][photo1]`)?.path || null;
            roomData.photo2 = req.files.find(file => file.fieldname === `rooms[${index}][photo2]`)?.path || null;
            roomData.photo3 = req.files.find(file => file.fieldname === `rooms[${index}][photo3]`)?.path || null;

            console.log(`Room ${index} data:`, roomData); // Log the room data to debug

            // Ensure required fields are present but allow for missing photos
            if (!roomData.propertyId || !roomData.roomNumber || !roomData.price || !roomData.capacity ||
                !roomData.deposit || !roomData.advance || !roomData.reservationFee) {
                throw new Error(`Missing required fields for room ${index}`);
            }

            // Check if at least one photo is provided
            if (!roomData.photo1 && !roomData.photo2 && !roomData.photo3) {
                throw new Error(`At least one photo is required for room ${index}`);
            }

            // Fetch the property to get the ownerId
            const property = await Property.findById(roomData.propertyId);
            if (!property) {
                throw new Error(`Property not found for ID: ${roomData.propertyId}`);
            }
            roomData.ownerId = property.userId; // Set ownerId from the property

            processedRooms.push(roomData);
        }

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
        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }
        res.json({ status: true, room: updatedRoom });
    } catch (error) {
        next(error);
    }
};
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


exports.reserveRoom = async (req, res) => {
    try {
        const { roomId, userId, reservationDuration } = req.body;

        // Find the room
        const room = await RoomModel.findById(roomId);
        if (!room || room.roomStatus !== 'available') {
            return res.status(400).json({ status: false, error: 'Room is not available for reservation' });
        }

        // Calculate reservation expiration
        const reservedDate = new Date();
        const reservationExpiration = new Date(reservedDate.getTime() + reservationDuration * 24 * 60 * 60 * 1000);

        // Update room status to 'reserved'
        room.roomStatus = 'reserved';
        room.reservedDate = reservedDate;
        room.reservationExpiration = reservationExpiration;

        await room.save();

        res.json({ status: true, room });
    } catch (error) {
        console.error('Error reserving room:', error);
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await RoomModel.findById(req.params.id)
            .populate('occupantNonUsers'); // Populate the occupantNonUsers field to get details
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room details', error });
    }
};



exports.markRoomAsAvailable = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const updatedRoom = await RoomServices.markAsAvailable(roomId);

        res.json({ status: true, success: updatedRoom });
    } catch (error) {
        console.error('Error marking room as available:', error);
        res.status(400).send({ error: error.message });
    }
};