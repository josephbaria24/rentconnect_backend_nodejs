const PropertyModel = require("../models/properties.model");
const PropertyServices = require("../services/property.services");
const  upload  = require('../multerConfig');

// Middleware for handling multiple file uploads
exports.uploadPhotos = upload.fields([
    { name: 'photo', maxCount: 1 },        // Main property photo
    { name: 'photo2', maxCount: 1 },       // Additional photo 2
    { name: 'photo3', maxCount: 1 },       // Additional photo 3
    { name: 'legalDocPhoto', maxCount: 1 },  // Legal document photo
    { name: 'legalDocPhoto2', maxCount: 1 }, // Additional legal doc photo 2
    { name: 'legalDocPhoto3', maxCount: 1 }, // Additional legal doc photo 3
]);

exports.createProperty = async (req, res, next) => {
    try {
        console.log('Files:', req.files);  // Debugging line

        // Extracting files
        const photo = req.files['photo'] ? req.files['photo'][0].path : null;
        const photo2 = req.files['photo2'] ? req.files['photo2'][0].path : null;
        const photo3 = req.files['photo3'] ? req.files['photo3'][0].path : null;
        const legalDocPhoto = req.files['legalDocPhoto'] ? req.files['legalDocPhoto'][0].path : null;
        const legalDocPhoto2 = req.files['legalDocPhoto2'] ? req.files['legalDocPhoto2'][0].path : null;
        const legalDocPhoto3 = req.files['legalDocPhoto3'] ? req.files['legalDocPhoto3'][0].path : null;

        // Validate if required fields are present
        const { userId, description, street, barangay, city, amenities, status, typeOfProperty, location } = req.body;

        // Ensure location is parsed correctly if it's a JSON string
        let parsedLocation;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid location format. Must be a valid JSON string.' });
            }
        } else {
            parsedLocation = location;
        }

        let property = await PropertyServices.createProperty(
            userId, description, photo, photo2, photo3, legalDocPhoto, legalDocPhoto2, legalDocPhoto3, street, barangay, city, amenities, status, typeOfProperty, parsedLocation
        );

        if (!property || !property._id) {
            return res.status(500).json({ error: 'Error saving property. No propertyId found.' });
        }

        res.json({ status: true, propertyId: property._id, property });
    } catch (error) {
        next(error);
    }
};

exports.updateProperty = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        // Extracting files
        const photo = req.files['photo'] ? req.files['photo'][0].path : null;
        const photo2 = req.files['photo2'] ? req.files['photo2'][0].path : null;
        const photo3 = req.files['photo3'] ? req.files['photo3'][0].path : null;
        const legalDocPhoto = req.files['legalDocPhoto'] ? req.files['legalDocPhoto'][0].path : null;
        const legalDocPhoto2 = req.files['legalDocPhoto2'] ? req.files['legalDocPhoto2'][0].path : null;
        const legalDocPhoto3 = req.files['legalDocPhoto3'] ? req.files['legalDocPhoto3'][0].path : null;

        // Gather updates from the body
        const updates = {
            ...req.body, // Spread existing updates from the body
            photo,
            photo2,
            photo3,
            legalDocPhoto,
            legalDocPhoto2,
            legalDocPhoto3,
        };

        // Extract the location from the request body
        const location = req.body.location; // Add this line to get the location from the request body

        // Parse location if it exists
        let parsedLocation;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location); // Parse the JSON string
            } catch (error) {
                return res.status(400).json({ error: 'Invalid location format. Must be a valid JSON string.' });
            }
        } else {
            parsedLocation = location; // Use the parsed location directly if it is already an object
        }

        // Add parsed location to updates
        updates.location = parsedLocation; // Add the parsed location to the updates object

        const updatedProperty = await PropertyServices.updateProperty(propertyId, updates);

        if (!updatedProperty) {
            return res.status(404).json({ status: false, error: 'Property not found' });
        }

        res.json({ status: true, property: updatedProperty });
    } catch (error) {
        next(error);
    }
};

// exports.updateProperty = async (req, res, next) => {
//     try {
//         const { propertyId } = req.params;
//         const updates = req.body;

//         const updatedProperty = await PropertyServices.updateProperty(propertyId, updates);

//         if (!updatedProperty) {
//             return res.status(404).json({ status: false, error: 'Property not found' });
//         }

//         res.json({ status: true, property: updatedProperty });
//     } catch (error) {
//         next(error);
//     }
// };
exports.getUserProperty = async (req, res, next) => {
    try {
        const { userId } = req.body;

        let property = await PropertyServices.getUserProperty(userId);

        res.json({ status: true, success: property });
    } catch (error) {
        next(error);
    }
};

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

exports.deleteProperty = async (req, res, next) => {
    try {
        const { id } = req.params; // Get the property ID from the request parameters
        const result = await PropertyServices.deletePropertyById(id); // Call the service method

        if (!result) {
            return res.status(404).json({ status: false, error: 'Property not found' });
        }

        res.json({ status: true, message: 'Property and its associated rooms and inquiries deleted successfully' });
    } catch (error) {
        next(error);
    }
};


