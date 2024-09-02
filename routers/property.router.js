const router = require('express').Router();
const PropertyController = require("../controller/property.controller")

router.post('/storeProperty',PropertyController.createProperty);

module.exports = router;