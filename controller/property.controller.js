const PropertyModel = require("../models/properties.model");
const PropertyServices = require("../services/property.services");


exports.createProperty = async (req, res, next)=>{
    try {
        const {userId,description,photo,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at} = req.body;

        let property = await PropertyServices.createProperty(userId,description,photo,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at);

        res.json({status:true, success:property});
    } catch (error) {
        next(error);
    }
}