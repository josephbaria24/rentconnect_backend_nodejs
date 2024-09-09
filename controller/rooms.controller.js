const RoomServices = require('../services/room.services');
const upload = require('../multerConfig');
const RoomModel = require('../models/room.model');

// Middleware for handling multiple file uploads
exports.uploadPhotos = upload.fields([
    { name: 'roomPhoto', maxCount: 3 }
]);

exports.createRoom = async (req, res, next) => {
    try {
        const { propertyId, price, capacity, deposit, advance, reservationDuration, reservationFee, roomNumber } = req.body;

        // Check if room data is provided
        // if (!room) {
        //     return res.status(400).json({ status: false, error: 'Room data is required' });
        // }

        // Extract files from the request
        const roomPhotos = req.files['roomPhoto'] || [];

        // Create the room object
        const roomData = {
            propertyId,
            price,
            capacity,
            deposit,
            advance,
            reservationDuration,
            reservationFee,
            roomNumber,
            photo1: roomPhotos[0] ? roomPhotos[0].filename : null,
            photo2: roomPhotos[1] ? roomPhotos[1].filename : null,
            photo3: roomPhotos[2] ? roomPhotos[2].filename : null,
        };

        // Save the room using the service
        const savedRoom = await RoomServices.createRoom(roomData);

        res.json({ status: true, success: savedRoom });
    } catch (error) {
        next(error);
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
        const updatedRoom = await RoomServices.updateRoom(id, updateData);
        if (!updatedRoom) {
            return res.status(404).json({ status: false, error: 'Room not found' });
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

exports.addUserToRoom = async (req, res, next) => {
    try {
        const { roomId, userId } = req.body;
        const room = await RoomServices.addUserToRoom(roomId, userId);
        res.json({ status: true, success: room });
    } catch (error) {
        next(error);
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
