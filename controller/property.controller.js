const PropertyModel = require("../models/properties.model");
const PropertyServices = require("../services/property.services");
const upload = require('../multerConfig');

exports.uploadPhoto = upload.single('photo');

exports.createProperty = async (req, res, next)=>{
    try {
        const photo = req.file ? req.file.path : null;

        const {userId,description,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at} = req.body;

        let property = await PropertyServices.createProperty(userId,description,photo,address,price,numberOfRooms,amenities,availableFrom,status,created_at,updated_at);

        res.json({status:true, success:property});
    } catch (error) {
        next(error);
    }
}

exports.getUserProperty = async (req, res, next)=>{
    try {
        const {userId} = req.body;

        let property = await PropertyServices.getUserProperty(userId);

        res.json({status:true, success:property});
    } catch (error) {
        next(error);
    }
}