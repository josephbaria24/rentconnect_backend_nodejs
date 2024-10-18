const router = require('express').Router();
const PropertyController = require("../controller/property.controller")



router.post('/storeProperty', PropertyController.uploadPhotos, PropertyController.createProperty)

router.post('/getUserPropertyList',PropertyController.getUserProperty);
router.get('/getAllProperties', PropertyController.getAllProperties); // New route
router.post('/getPropertiesByIds', PropertyController.getPropertiesByIds);
router.get('/getUserBookmarks/:userId', PropertyController.getBookmarkedProperties);
router.delete('/deleteProperty/:id', PropertyController.deleteProperty);
router.put('/properties/:propertyId', PropertyController.updateProperty);
module.exports = router;