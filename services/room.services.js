const RoomModel = require('../models/room.model');
const OccupantModel = require('../models/occupant.model');


class RoomServices {
    static async createMultipleRooms(roomsData) {
        const savedRooms = await RoomModel.insertMany(roomsData);
        return savedRooms;
    }
    // static async createMultipleRooms(roomsData) {
    //     const rooms = [];
    //     for (const roomData of roomsData) {
    //         const room = new RoomModel(roomData);
    //         rooms.push(await room.save());
    //     }
    //     return rooms;
    // }

    static async getRoomsByPropertyId(propertyId) {
        return await RoomModel.find({ propertyId }); // Find all rooms where propertyId matches
    }

    static async getRoom(id) {
        return await RoomModel.findById(id);
    }

    static async updateRoom(id, updateData) {
        return await RoomModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    static async deleteRoom(id) {
        return await RoomModel.findByIdAndDelete(id);
    }
    static async addUserToRoom(roomId, userId) {
    const room = await RoomModel.findById(roomId).populate('occupantUsers');

    if (room.occupantUsers.length + room.occupantNonUsers.length >= room.capacity) {
        throw new Error('Room capacity reached');
    }

    if (room.occupantUsers.includes(userId)) {
        throw new Error('User already occupies the room');
    }

    room.occupantUsers.push(userId);
    return await room.save();
}
    // Method to add non-users (occupants) to the room
    static async addNonUserToRoom(roomId, occupantData) {
        const room = await RoomModel.findById(roomId).populate('occupantNonUsers');

        if (room.occupantUsers.length + room.occupantNonUsers.length >= room.capacity) {
            throw new Error('Room capacity reached');
        }

        const occupant = new OccupantModel(occupantData);
        await occupant.save();

        room.occupantNonUsers.push(occupant._id);
        return await room.save();
    }
}

module.exports = RoomServices;
