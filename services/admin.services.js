const UserModel = require('../models/user.model');
const { ProfileModel } = require('../models/profile.model');
const PropertyModel = require('../models/properties.model');
const RoomModel = require('../models/room.model');

class AdminService {
    static async fetchAllUsersWithDetails() {
        try {
            // Aggregation pipeline to fetch users with their profiles, properties, and rooms
            const users = await UserModel.aggregate([
                {
                    $lookup: {
                        from: 'profiles', // Collection name for Profile
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'profile'
                    }
                },
                {
                    $unwind: {
                        path: '$profile',
                        preserveNullAndEmptyArrays: true // Preserve users without profiles
                    }
                },
                {
                    $lookup: {
                        from: 'properties', // Collection name for Property
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'properties'
                    }
                },
                {
                    $unwind: {
                        path: '$properties',
                        preserveNullAndEmptyArrays: true // Preserve users without properties
                    }
                },
                {
                    $lookup: {
                        from: 'rooms', // Collection name for Room
                        localField: 'properties._id',
                        foreignField: 'propertyId',
                        as: 'properties.rooms'
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        email: { $first: '$email' },
                        profile: { $first: '$profile' },
                        properties: { $push: '$properties' }
                    }
                }
            ]);

            return users;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;
