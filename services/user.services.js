const UserModel = require('../models/user.model')
const {ProfileModel} = require('../models/profile.model')
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

    static async updateProfileCompletion(userId, isProfileComplete) {
        try {
            return await UserModel.findByIdAndUpdate(
                userId,
                { isProfileComplete },
                { new: true } // Return the updated user
            );
        } catch (error) {
            throw error;
        }
    }
    static async fetchUserDetails(userId) {
        try {
          const user = await UserModel.findById(userId);
          if (!user) {
            return null;
          }
    
          const profile = await ProfileModel.findOne({ userId });
          return {
            ...user.toObject(),
            profile: profile ? profile.toObject() : null, // Include profile if it exists
          };
        } catch (error) {
          throw error;
        }
      }
      static async updateUserProfilePicture(userId, profilePictureUrl) {
        try {
            return await UserModel.findByIdAndUpdate(
                userId,
                { profilePicture: profilePictureUrl },
                { new: true } // Return the updated user
            );
        } catch (error) {
            throw error;
        }
    }
    static async updateUserInfo(userId, updatedFields) {
        try {
            return await UserModel.findByIdAndUpdate(
                userId,
                { $set: updatedFields }, // Set only the fields provided
                { new: true, runValidators: true } // Return the updated user, apply schema validators
            );
        } catch (error) {
            throw error;
        }
    }
    
    
    


static async generateToken(tokenData,secretKey,jwt_expire){
    return jwt.sign(tokenData, secretKey,{expiresIn:jwt_expire});
}
}

module.exports = UserService;