const RoomModel = require('../models/room.model');
const OccupantModel = require('../models/occupant.model');

class RoomServices {
    static async createMultipleRooms(roomsData) {
        const savedRooms = await RoomModel.insertMany(roomsData);
        return savedRooms;
    }

    static async getRoomsByPropertyId(propertyId) {
        return await RoomModel.find({ propertyId });
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
        room.rentedDate = new Date(); // Set the rented date when user occupies the room
        return await room.save();
    }

    // Add a non-user (occupant) to the room
    static async addNonUserToRoom(roomId, occupantData) {
        const room = await RoomModel.findById(roomId).populate('occupantNonUsers');

        if (room.occupantUsers.length + room.occupantNonUsers.length >= room.capacity) {
            throw new Error('Room capacity reached');
        }

        const occupant = new OccupantModel(occupantData);
        await occupant.save();

        room.occupantNonUsers.push(occupant._id);
        room.rentedDate = new Date(); // Set the rented date when non-user occupies the room
        return await room.save();
    }

    // Method to reserve a room and set the reservedDate
    static async reserveRoom(roomId) {
        const room = await RoomModel.findById(roomId);

        if (room.roomStatus === 'available') {
            room.roomStatus = 'reserved';
            room.reservedDate = new Date(); // Set the reservation date
            return await room.save();
        } else {
            throw new Error('Room is not available for reservation');
        }
    }

    // Method to rent a room and set the rentedDate
    static async rentRoom(roomId) {
        const room = await RoomModel.findById(roomId);

        if (room.roomStatus === 'reserved' || room.roomStatus === 'available') {
            room.roomStatus = 'occupied';
            room.rentedDate = new Date(); // Set the rental date
            return await room.save();
        } else {
            throw new Error('Room is not available for rent');
        }
    }
}

module.exports = RoomServices;
