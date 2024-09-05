const PropertyModel = require('../models/properties.model');

class PropertyServices{
    static async createProperty(userId,description,photo,legalDocPhoto,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at){
        const createProperty = new PropertyModel({userId,description,photo,legalDocPhoto,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at});
        return await createProperty.save();
    }
    static async getUserProperty(userId){
        const getUserProperty = await PropertyModel.find({userId})
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