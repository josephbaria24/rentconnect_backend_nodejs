const PropertyModel = require('../models/properties.model');
class PropertyServices {
    static async createRoom(propertyId, roomNumber, capacity, price, deposit, advance, reservationDuration, reservationFee, photos) {
        // Create the room with the provided data
        const createRoom = new RoomModel({
            propertyId,
            roomNumber,
            capacity,
            price,
            deposit,
            advance,
            reservationDuration,
            reservationFee,
            photos  // Assuming photos is an array of filenames
        });

        // Save the room
        return await createRoom.save();
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
