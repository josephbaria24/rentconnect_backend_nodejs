const PropertyModel = require("../models/properties.model");
const PropertyServices = require("../services/property.services");
const upload = require('../multerConfig');

// Middleware for handling multiple file uploads
exports.uploadPhotos = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'legalDocPhoto', maxCount: 1 }
]);

exports.createProperty = async (req, res, next) => {
    try {
        const photo = req.files['photo'] ? req.files['photo'][0].path : null;
        const legalDocPhoto = req.files['legalDocPhoto'] ? req.files['legalDocPhoto'][0].path : null;

        const { userId, description, address, price, numberOfRooms, amenities, availableFrom, status, created_at, updated_at } = req.body;

        let property = await PropertyServices.createProperty(userId, description, photo, legalDocPhoto, address, price, numberOfRooms, amenities, availableFrom, status, created_at, updated_at);

        res.json({ status: true, success: property });
    } catch (error) {
        next(error);
    }
}

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

  