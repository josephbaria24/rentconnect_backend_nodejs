const UserModel = require('../models/user.model');
const { ProfileModel } = require('../models/profile.model');
const PropertyModel = require('../models/properties.model');
const RoomModel = require('../models/room.model');

class AdminService {
    static async fetchAllUsersWithDetails() {
        try {
            // Aggregation pipeline to fetch users with pending property requests
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
                        from: 'pending_request_property', // Collection name for Property
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'properties'
                    }
                },
                {
                    $unwind: {
                        path: '$properties',
                        preserveNullAndEmptyArrays: false // Only keep users with properties
                    }
                },
                {
                    $lookup: {
                        from: 'pending_request_room', // Collection name for Room
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
                },
                {
                    // Match users who have at least one property with a pending request
                    $match: {
                        'properties.0': { $exists: true } // Ensure the user has at least one property
                    }
                }
            ]);

            return users;
        } catch (error) {
            throw error;
        }
    }
    static async approveProfile(userId) {
        try {
            const profile = await ProfileModel.findOneAndUpdate(
                { userId },
                { profileStatus: 'approved' },
                { new: true }
            );
            return profile;
        } catch (error) {
            throw error;
        }
    }

    static async rejectProfile(userId) {
        try {
            const profile = await ProfileModel.findOneAndUpdate(
                { userId },
                { profileStatus: 'rejected' },
                { new: true }
            );
            return profile;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;
