// routes/occupant.routes.js
const express = require('express');
const router = express.Router();
const occupantController = require('../controller/occupant.controller');

// Define routes for occupants
router.post('/occupant/create/room/:roomId', occupantController.createOccupantAndAddToRoom); // Create occupant
router.get('/occupant/getAll', occupantController.getAllOccupants); // Get all occupants
router.get('/occupant/get/:id', occupantController.getOccupantById); // Get occupant by ID
router.put('/occupant/update/:id', occupantController.updateOccupant); // Update occupant
router.delete('/occupant/delete/:id', occupantController.deleteOccupant); // Delete occupant

module.exports = router;
