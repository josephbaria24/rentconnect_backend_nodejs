const router = require('express').Router();
const PropertyController = require("../controller/property.controller")
const upload = require('../models/properties.model')


router.post('/storeProperty', PropertyController.uploadPhotos, PropertyController.createProperty)

router.post('/getUserPropertyList',PropertyController.getUserProperty);
router.get('/getAllProperties', PropertyController.getAllProperties); // New route
router.post('/getPropertiesByIds', PropertyController.getPropertiesByIds);
router.get('/getUserBookmarks/:userId', PropertyController.getBookmarkedProperties);
module.exports = router;