const PropertyModel = require('../models/properties.model');

class PropertyServices{
    static async createProperty(userId,description,photo,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at){
        const createProperty = new PropertyModel({userId,description,photo,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at});
        return await createProperty.save();
    }
    static async getUserProperty(userId){
        const getUserProperty = await PropertyModel.find({userId})
        return getUserProperty;
    }
}

module.exports = PropertyServices;