const express = require('express');
const router = express.Router();
const RoomController = require('../controller/rooms.controller');
const upload = require('../multerConfig'); // Import multer configuration

// Apply the upload middleware to routes that need file uploads
router.post('/createRoom', RoomController.uploadPhotos, RoomController.createRoom);

router.post('/rooms/addUser', RoomController.addUserToRoom);
router.post('/rooms/addNonUser', RoomController.addNonUserToRoom);

router.get('/getRoom/:id', RoomController.getRoom);
router.put('/updateRoom/:id', RoomController.updateRoom);
router.delete('/deleteRoom/:id', RoomController.deleteRoom);
router.get('/properties/:propertyId/rooms', RoomController.getRoomsByPropertyId);

module.exports = router;
