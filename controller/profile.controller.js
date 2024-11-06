const { ProfileModel } = require('../models/profile.model');
const upload = require('../multerConfig'); // Adjust the path if needed
const path = require('path');
const ProfileService = require('../services/profile.services');
const UserModel = require('../models/user.model')
const {sendProfileUpdateEmail} = require('../services/emailer.services')

exports.updateProfile = async (req, res) => {
  try {
      const { userId, firstName, lastName, gender, phone, address, isProfileComplete } = req.body;

      const updateData = {
          firstName,
          lastName,
          gender,
          contactDetails: {
              phone,
              address,
          },
          isProfileComplete,
          profileStatus: 'pending', // Set profile status to pending
          updated_at: Date.now(),
      };

      // Call to the service to update the profile
      const profile = await ProfileService.updateProfile(userId, updateData);

      if (profile) {
          // Send email notification to admin for profile update request
          sendProfileUpdateEmail(updateData, (error, response) => {
              if (error) {
                  console.error('Error sending email:', error);
              } else {
                  console.log('Email sent:', response);
              }
          });

          return res.status(200).json({ status: true, profile });
      } else {
          return res.status(400).json({ status: false, message: 'Profile not found' });
      }
  } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ status: false, error: error.message });
  }
};


exports.uploadValidId = (req, res) => {
  upload.single('validIdImage')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, error: err.message });
    }

    try {
      const { userId } = req.body;
      const validIdImagePath = req.file.path;

      const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { valid_id: validIdImagePath, updated_at: Date.now() },
        { new: true }
      );

      res.status(200).json({ status: true, profile });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
exports.checkProfileCompletion = async (req, res) => {
  try {
      const userId = req.params.userId; // Get userId from URL parameters
      // Fetch the user and profile details
      const user = await UserModel.findById(userId);
      const profile = await ProfileModel.findOne({ userId });

      if (user) {
          // Set `isProfileComplete` to profile's actual completion status
          const isProfileComplete = user ? user.isProfileComplete : false;
          const userRole = user ? user.role : 'none';
          const profileStatus = profile ? profile.profileStatus : 'none';
          
          res.status(200).json({
              status: true,
              isProfileComplete: isProfileComplete,
              profileStatus: profileStatus, // Reflect actual completion status
              userRole: userRole,
          });
      } else {
          // User not found
          res.status(404).json({ status: false, error: 'User not found' });
      }
  } catch (error) {
      res.status(500).json({ status: false, error: error.message });
  }
};

