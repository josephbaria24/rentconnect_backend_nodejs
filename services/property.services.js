const PropertyModel = require('../models/properties.model');
const RoomModel = require('../models/room.model');
const InquiryModel = require('../models/inquiries');


class PropertyServices {
    static async createProperty(userId, description, photo, photo2, photo3, legalDocPhoto, legalDocPhoto2, legalDocPhoto3, street, barangay, city, amenities, status, typeOfProperty, location) {
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
        // Find and delete the property
        const property = await PropertyModel.findByIdAndDelete(propertyId);
        
        if (!property) {
            return null; // Property not found
        }
    
        // Delete associated rooms
        await RoomModel.deleteMany({ propertyId });
    
        // Delete associated inquiries
        await InquiryModel.deleteMany({ roomId: { $in: property.rooms } });
    
        return property; // Return the deleted property for confirmation
    }
    // Add the update method in PropertyServices

    static async updateProperty(propertyId, updates) {
        try {
            const updatedProperty = await PropertyModel.findByIdAndUpdate(propertyId, updates, { new: true });
            return updatedProperty;
        } catch (error) {
            throw error;
        }
    }

    
}

module.exports = PropertyServices;
