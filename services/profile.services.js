const UserModel = require('../models/user.model'); 
const { ProfileModel } = require('../models/profile.model');// Import UserModel

class ProfileService {
  static async updateProfile(userId, updateData) {
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true }
      );

      // Update the user document if profile is complete
      if (updateData.isProfileComplete) {
        await UserModel.findByIdAndUpdate(userId, { isProfileComplete: true });
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  static async updateValidId(userId, validIdImage) {
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { valid_id: validIdImage, updated_at: Date.now() },
        { new: true }
      );
      return profile;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProfileService;
