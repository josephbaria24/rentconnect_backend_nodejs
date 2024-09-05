const UserModel = require('../models/user.model')
const jwt = require('jsonwebtoken');

class UserService{
    static async registerUser(email, password){
        try{
            const createUser = new UserModel({email, password});
            return await createUser.save();
        }catch(err){
            throw err;
        }
    }

    static async checkuser(email){
        try {
            return await UserModel.findOne({email});
        } catch (error) {
            throw error
        }
    }
    static async getUserById(userId) {
        try {
            return await UserModel.findById(userId);
        } catch (error) {
            throw error;
        }
    }
    static async addBookmark(userId, propertyId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.bookmarks.includes(propertyId)) {
                user.bookmarks.push(propertyId);
                await user.save();
            }
            return user;
        } catch (error) {
            throw error;
        }
    }
    static async removeBookmark(userId, propertyId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== propertyId);
            await user.save();
            return user;
        } catch (error) {
            throw error;
        }
    }
    // static async getUserBookmarks(userId) {
    //     try {
    //         const user = await UserModel.findById(userId).populate('bookmarks');
    //         if (!user) {
    //             throw new Error('User not found');
    //         }
    //         return { status: true, properties: user.bookmarks };
    //     } catch (error) {
    //         console.error('Error fetching bookmarks:', error); // Check your logs here
    //         throw error;
    //     }
    //  }
     


static async generateToken(tokenData,secretKey,jwt_expire){
    return jwt.sign(tokenData, secretKey,{expiresIn:jwt_expire});
}
}

module.exports = UserService;