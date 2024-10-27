const router = require('express').Router();
const PropertyController = require("../controller/property.controller")
const RoomModel = require('../models/room.model');
const PropertyModel = require('../models/properties.model')

router.post('/storeProperty', PropertyController.uploadPhotos, PropertyController.createProperty)

router.post('/getUserPropertyList',PropertyController.getUserProperty);
router.get('/getAllProperties', PropertyController.getAllProperties); // New route
router.get('/getPropertiesByIds', PropertyController.getPropertiesByIds);
router.get('/getUserBookmarks/:userId', PropertyController.getBookmarkedProperties);
router.delete('/deleteProperty/:id', PropertyController.deleteProperty);
router.put('/properties/:propertyId', PropertyController.uploadPhotos, PropertyController.updateProperty);

router.post('/rateProperty/:propertyId', async (req, res) => {
    const { propertyId } = req.params;
    const { userId, ratingValue, comment } = req.body;

    try {
        // Find if the user is an occupant of any room in the property
        const room = await RoomModel.findOne({
            propertyId,
            occupantUsers: userId
        });

        if (!room) {
            return res.status(403).json({ message: 'Only occupants can rate this property' });
        }

        // Add the rating to the property model
        await PropertyModel.findByIdAndUpdate(
            propertyId,
            { $push: { ratings: { occupantId: userId, ratingValue, comment } } },
            { new: true }
        );

        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating', error });
    }
});


// Route to get average rating for a property
router.get('/averageRating/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Find the property by ID
        const property = await PropertyModel.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Calculate average rating
        const ratings = property.ratings;
        if (ratings.length === 0) {
            return res.status(200).json({ averageRating: 0 }); // No ratings yet
        }

        const totalRating = ratings.reduce((acc, rating) => acc + rating.ratingValue, 0);
        const averageRating = totalRating / ratings.length;

        res.status(200).json({ averageRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;