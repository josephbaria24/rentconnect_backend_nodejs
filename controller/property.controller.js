const PropertyModel = require("../models/properties.model");
const PropertyServices = require("../services/property.services");
const upload = require('../multerConfig');

// Middleware for handling multiple file uploads
exports.uploadPhotos = upload.fields([
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'photo', maxCount: 3 },  // Allow up to 3 photos
    { name: 'legalDocPhoto', maxCount: 3 },  // Allow up to 3 legal document photos
    { name: 'roomPhotos', maxCount: 10 }
]);

exports.createProperty = async (req, res, next) => {
    try {
        let rooms;
        try {
            rooms = JSON.parse(req.body.rooms);
        } catch (error) {
            return res.status(400).json({ status: false, error: 'Invalid JSON format for rooms' });
        }

        const coverPhoto = req.files['coverPhoto'] ? req.files['coverPhoto'][0].path : null;
        const photos = req.files['photo'] ? req.files['photo'].map(file => file.path) : [];  // Handle multiple photos
        const legalDocPhotos = req.files['legalDocPhoto'] ? req.files['legalDocPhoto'].map(file => file.path) : [];  // Handle multiple legal document photos
        const roomPhotos = req.files['roomPhotos'] ? req.files['roomPhotos'].map(file => file.path) : [];

        rooms.forEach((room, index) => {
            room.photos = roomPhotos.slice(index * 2, (index + 1) * 2); // Adjust according to the number of photos
        });

        const { userId, description, address, price, numberOfRooms, amenities, availableFrom, status } = req.body;

        let property = await PropertyServices.createProperty(
            userId, description, coverPhoto, photos, legalDocPhotos, rooms, address, price, numberOfRooms, amenities, availableFrom, status
        );

        res.json({ status: true, success: property });
    } catch (error) {
        next(error);
    }
};


exports.getUserProperty = async (req, res, next) => {
    try {
        const { userId } = req.body;

        let property = await PropertyServices.getUserProperty(userId);

        res.json({ status: true, success: property });
    } catch (error) {
        next(error);
    }
}

exports.getAllProperties = async (req, res, next) => {
    try {
        let properties = await PropertyServices.getAllProperties();

        res.json({ status: true, success: properties });
    } catch (error) {
        next(error);
    }
};

exports.getPropertiesByIds = async (req, res, next) => {
    try {
      const { ids } = req.body;
      const properties = await PropertyServices.getPropertiesByIds(ids);
  
      if (!properties.length) {
        return res.status(404).json({ status: false, error: 'No properties found' });
      }
  
      res.json({ status: true, properties });
    } catch (error) {
      next(error);
    }
  };
  exports.getBookmarkedProperties = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        const propertyIds = user.bookmarks;
        const properties = await PropertyModel.find({ '_id': { $in: propertyIds } });

        res.json(properties);
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

  