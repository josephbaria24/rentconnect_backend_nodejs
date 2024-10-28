// controllers/occupant.controller.js
const OccupantModel = require('../models/occupant.model')
const RoomModel = require('../models/room.model'); // Make sure to import your Room model

// Create a new occupant
// Create a new occupant and add to the specified room's occupantNonUsers
exports.createOccupantAndAddToRoom = async (req, res) => {
    const { roomId } = req.params; // Get room ID from request parameters
    const occupantData = req.body;

    try {
        // Step 1: Create the Occupant
        const newOccupant = await OccupantModel.create(occupantData);

        // Step 2: Add the new occupant's ID to the occupantNonUsers array in the specified room
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
exports.deleteOccupant = async (req, res) => {
    try {
        const occupant = await OccupantModel.findByIdAndDelete(req.params.id);
        if (!occupant) {
            return res.status(404).json({ message: 'Occupant not found' });
        }
        res.status(200).json({ message: 'Occupant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting occupant', error });
    }
};

