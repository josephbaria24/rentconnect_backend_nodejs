const UserModel = require('../models/user.model')
const {ProfileModel} = require('../models/profile.model')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailService = require('../services/admin.services');
const otpService = require('../services/otp.services');



class UserService{
    // static async registerUser(email, password){
    //     try{
    //         const createUser = new UserModel({email, password});
    //         return await createUser.save();
    //     }catch(err){
    //         throw err;
    //     }
    // }
    static async registerUser(email, password) {
        try {
            // Check if the email already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                throw new Error('Email already registered');
            }
    
            // Create user
            const createUser = new UserModel({ email, password });
    
            // Generate OTP for email verification
            const otpParams = { email }; // Just pass the email, OTP generation logic is in otp.services.js
            otpService.sendOTP(otpParams, async (error, fullHash) => {
                if (error) throw error;
    
                // Save the OTP hash and email in user document
                createUser.verificationCode = fullHash;
                await createUser.save();
            });
    
            return await createUser.save();
        } catch (err) {
            throw err; // Rethrow error for controller to catch
        }
    }
    static async verifyEmailOTP(email, otp) {
        try {
            return new Promise(async (resolve, reject) => {
                // Find the user by email
                const user = await UserModel.findOne({ email });
                if (!user) {
                    return reject(new Error("User not found."));
                }
    
                const params = { email, otp, hash: user.verificationCode }; // Get verificationCode (hash) from user
    
                otpService.verifyOTP(params, async (error, result) => {
                    if (error) {
                        return reject(error);
                    }
    
                    // Once OTP is verified, update the user's email verification status
                    const updatedUser = await UserModel.findOneAndUpdate(
                        { email },
                        { isEmailVerified: true, verificationCode: null },
                        { new: true }
                    );
                    return resolve(updatedUser);
                });
            });
        } catch (err) {
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
    static async updatePassword(userId, newPassword) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            return await UserModel.findByIdAndUpdate(
                userId,
                { password: hashedPassword },
                { new: true, runValidators: true } // Return the updated user
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