const RoomModel = require('../models/room.model');
const OccupantModel = require('../models/occupant.model');
const InquiryModel = require('../models/inquiries');
const EndedInquiry = require('../models/endedInquiry.model');
const PaymentModel = require('../models/payment.model');  // Import the PaymentModel

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

    static async updateRoom(roomId, updateData) {
        try {
            const room = await RoomModel.findById(roomId);
    
            if (!room) {
                throw new Error('Room not found');
            }
    
            // Update the room with the new data
            Object.assign(room, updateData);
    
            // Save the updated room data to the database
            await room.save();
    
            return room;
        } catch (error) {
            console.error('Error updating room:', error);
            throw new Error('Failed to update room');
        }
    }
    
    // static async updateRoom(id, updateData) {
    //     return await RoomModel.findByIdAndUpdate(id, updateData, { new: true });
    // }

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
            room.reservedDate = new Date(); // Explicitly set reservedDate here
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
    // static async markAsAvailable(roomId) {
    //     try {
    //         const room = await RoomModel.findById(roomId);
    //         if (!room) {
    //             throw new Error('Room not found');
    //         }
    
    //         // Create EndedInquiry for all pending inquiries
    //         const pendingInquiries = await InquiryModel.find({ roomId, status: 'pending' });
    //         console.log('Pending Inquiries:', pendingInquiries); // Debugging line
    
    //         for (let inquiry of pendingInquiries) {
    //             // Create ended inquiry with moveOutDate as the current date
    //             const endedInquiry = new endedInquiryModel({
    //                 userId: inquiry.userId,
    //                 roomId: inquiry.roomId,
    //                 requestType: inquiry.requestType,
    //                 moveOutDate: new Date(),  // Set the moveOutDate as the current date
    //             });
    
    //             try {
    //                 // Save the ended inquiry
    //                 await endedInquiry.save();
    //             } catch (saveError) {
    //                 console.error('Error saving ended inquiry:', saveError);
    //             }
    //         }
    
    //         // Delete all payments associated with this room
    //         await PaymentModel.deleteMany({ roomId: roomId });
    
    //         // Now clear the reservation inquiries and mark the room as available
    //         room.roomStatus = 'available';
    //         room.dueDate = null;
    //         room.rentedDate = null;
    //         room.reservedDate = null;
    //         room.reservationExpiration = null;
    //         room.reservationDuration = null;
    //         room.occupantUsers = [];
    //         room.occupantNonUsers = [];
    //         room.reservationInquirers = [];
    
    //         await room.save();
    
    //         return room;
    //     } catch (error) {
    //         console.error('Error marking room as available:', error);
    //         throw new Error('Failed to mark room as available');
    //     }
    // }


    static async markAsAvailable(roomId) {
        try {
            const room = await RoomModel.findById(roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            // Find all inquiries related to this room that are not ended
            const inquiries = await InquiryModel.find({ roomId: roomId, status: { $ne: 'ended' } });

            // Move these inquiries to the EndedInquiry model
            for (const inquiry of inquiries) {
                const endedInquiry = new EndedInquiry({
                    userId: inquiry.userId,
                    roomId: inquiry.roomId,
                    requestType: inquiry.requestType,
                    moveOutDate: inquiry.moveOutDate, // Assuming you have a moveOutDate in the inquiry
                    requestDate: inquiry.requestDate,
                });

                // Save the ended inquiry to the database
                await endedInquiry.save();

                // Delete the original inquiry
                await InquiryModel.findByIdAndDelete(inquiry._id);
            }

            // Delete all payments associated with this room
            await PaymentModel.deleteMany({ roomId: roomId });

            // Update room status to "available" and clear specified fields
            room.roomStatus = 'available';
            room.dueDate = null;
            room.rentedDate = null;
            room.reservedDate = null;
            room.reservationExpiration = null;
            room.reservationDuration = null;
            room.occupantUsers = [];
            room.occupantNonUsers = [];
            room.reservationInquirers = [];

            // Save the updated room data to the database
            await room.save();

            return room;
        } catch (error) {
            console.error('Error marking room as available:', error);
            throw new Error('Failed to mark room as available');
        }
    }
}

module.exports = RoomServices;
