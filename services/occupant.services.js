// services/occupant.service.js
const OccupantModel = require('../models/occupant.model')

exports.createOccupant = async (data) => {
    const occupant = new OccupantModel(data);
    return await occupant.save();
};

exports.getAllOccupants = async () => {
    return await OccupantModel.find();
};

exports.getOccupantById = async (id) => {
    return await OccupantModel.findById(id);
};

exports.updateOccupant = async (id, data) => {
    return await OccupantModel.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteOccupant = async (id) => {
    return await OccupantModel.findByIdAndDelete(id);
};
