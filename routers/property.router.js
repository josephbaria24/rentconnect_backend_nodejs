const router = require('express').Router();
const PropertyController = require("../controller/property.controller")
const upload = require('../models/properties.model')

router.post('/storeProperty', PropertyController.uploadPhoto, PropertyController.createProperty)

router.post('/getUserPropertyList',PropertyController.getUserProperty);

module.exports = router;