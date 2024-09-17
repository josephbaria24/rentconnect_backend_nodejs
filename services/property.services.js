const PropertyModel = require('../models/properties.model');

class PropertyServices {
    static async createProperty(userId, description, photo, photo2, photo3, legalDocPhoto, legalDocPhoto2, legalDocPhoto3, street, barangay, city, amenities, availableFrom, status, typeOfProperty, location) {
        // Validate location
        if (!location || !location.type || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            throw new Error('Invalid location format. It must include type and coordinates.');
        }
    
        // Ensure required legal document photos are present
        // if (!legalDocPhoto || !legalDocPhoto3) {
        //     throw new Error('Legal document photos are missing.');
        // }
    
        // Create the property with the additional fields
        const createProperty = new PropertyModel({
            userId,
            description,
            photo,
            photo2,
            photo3,
            legalDocPhoto,
            legalDocPhoto2,
            legalDocPhoto3,
            street,
            barangay,
            city,
            amenities,
            availableFrom,
            status,
            typeOfProperty,
            location
        });
    
        return await createProperty.save();
    }
    
    static async getUserProperty(userId) {
        const getUserProperty = await PropertyModel.find({ userId });
        return getUserProperty;
    }

    static async getAllProperties() {
        const getAllProperties = await PropertyModel.find();
        return getAllProperties;
    }

    static async getPropertiesByIds(ids) {
        try {
            return await PropertyModel.find({ '_id': { $in: ids } });
        } catch (error) {
            throw error;
        }
    }
    static async deletePropertyById(propertyId) {
        try {
            // Remove the property by its ID
            const result = await PropertyModel.findByIdAndDelete(propertyId);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PropertyServices;
