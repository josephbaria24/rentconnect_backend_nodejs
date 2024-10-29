// controllers/occupant.controller.js
const OccupantModel = require('../models/occupant.model')
const RoomModel = require('../models/room.model'); // Make sure to import your Room model

// Create a new occupant
// Create a new occupant and add to the specified room's occupantNonUsers, considering room capacity
exports.createOccupantAndAddToRoom = async (req, res) => {
    const { roomId } = req.params; // Get room ID from request parameters
    const occupantData = req.body;

    try {
        // Step 1: Find the room by ID and check current occupants
        const room = await RoomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Calculate the current number of occupants
        const currentOccupantsCount = room.occupantUsers.length + room.occupantNonUsers.length;

        // Check if adding another occupant would exceed room capacity
        if (currentOccupantsCount >= room.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Room capacity exceeded. Cannot add more occupants.'
            });
        }

        // Step 2: Create the new occupant
        const newOccupant = await OccupantModel.create(occupantData);

        // Step 3: Add the new occupant's ID to the occupantNonUsers array in the specified room
        await RoomModel.findByIdAndUpdate(roomId, {
            $push: { occupantNonUsers: newOccupant._id }
        });

        res.status(201).json({
            success: true,
            message: 'Occupant created and added to room successfully',
            occupant: newOccupant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating occupant and updating room',
            error
        });
    }
};

// Get all occupants
exports.getAllOccupants = async (req, res) => {
    try {
        const occupants = await OccupantModel.find();
        res.status(200).json(occupants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching occupants', error });
    }
};

// Get an occupant by ID
exports.getOccupantById = async (req, res) => {
    try {
        const occupant = await OccupantModel.findById(req.params.id);
        if (!occupant) {
            return res.status(404).json({ message: 'Occupant not found' });
        }
        res.status(200).json(occupant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching occupant', error });
    }
};

// Update an occupant
exports.updateOccupant = async (req, res) => {
    try {
        const occupant = await OccupantModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!occupant) {
            return res.status(404).json({ message: 'Occupant not found' });
        }
        res.status(200).json({ message: 'Occupant updated successfully', occupant });
    } catch (error) {
        res.status(400).json({ message: 'Error updating occupant', error });
    }
};

// Delete an occupant
// Delete an occupant
exports.deleteOccupant = async (req, res) => {
    try {
        // Find and delete the occupant by ID
        const occupant = await OccupantModel.findByIdAndDelete(req.params.id);
        
        if (!occupant) {
            return res.status(404).json({ message: 'Occupant not found' });
        }

        // Find the room that contains the occupant's ID in occupantNonUsers
        await RoomModel.updateOne(
            { occupantNonUsers: occupant._id },  // Locate room with occupant ID
            { $pull: { occupantNonUsers: occupant._id } }  // Remove occupant ID from occupantNonUsers array
        );

        res.status(200).json({ message: 'Occupant deleted successfully and removed from room' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting occupant', error });
    }
};


