const PropertyModel = require('../models/properties.model');

class PropertyServices {
    static async createProperty(userId, description, coverPhoto, photos, legalDocPhotos, rooms, address, price, numberOfRooms, amenities, availableFrom, status) {
        const createProperty = new PropertyModel({
            userId,
            description,
            coverPhoto,
            photo: photos, // Handle array of photos
            legalDocPhoto: legalDocPhotos, // Handle array of legal document photos
            rooms, // Array of rooms with price and capacity
            address,
            price,
            numberOfRooms,
            amenities,
            availableFrom,
            status
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
}

module.exports = PropertyServices;
