const UserService = require('../services/user.services');
const PropertyModel = require('../models/properties.model');
const NotificationService = require('../services/notification.services');
const upload = require('../multerConfig');
const path = require('path');

exports.register = async(req,res,next)=>{
    try{
        const { email, password } = req.body;
        const successRes = await UserService.registerUser(email, password);
        res.json({status:true, success:"User Registered Successfully"});
    } catch(error) {
        res.status(500).json({ status: false, error: 'Registration failed. Please try again.' });
    }
}

exports.login = async(req,res,next)=>{
    try{
        const { email, password } = req.body;

        const user = await UserService.checkuser(email);

        if(!user){
            return res.status(404).json({ status: false, error: 'User does not exist.' });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({ status: false, error: 'Invalid password. Please try again.' });
        }

        user.last_login = new Date();
        await user.save();

        let tokenData = {_id:user._id,email:user.email};
        const token = await UserService.generateToken(tokenData,"secretKey",'1h');
        res.status(200).json({status:true, token:token})

    } catch(error) {
        console.error('Error in login:', error);
        res.status(500).json({ status: false, error: 'Login failed. Please try again.' });
    }
}

exports.getUserEmailById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const user = await UserService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found.' });
        }

        res.json({ status: true, email: user.email });
    } catch (error) {
        console.error('Error fetching user email:', error);
        res.status(500).json({ status: false, error: 'Failed to fetch user email. Please try again.' });
    }
};

exports.addBookmark = async (req, res, next) => {
    try {
        const { userId, propertyId } = req.body;
        const user = await UserService.addBookmark(userId, propertyId);
        res.json({ status: true, user });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ status: false, error: 'Failed to add bookmark. Please try again.' });
    }
};


exports.removeBookmark = async (req, res, next) => {
    try {
        const { userId, propertyId } = req.body;

        // Validate input
        if (!userId || !propertyId) {
            return res.status(400).json({ status: false, error: 'UserId and PropertyId are required' });
        }

        // Fetch the user and remove the property from bookmarks
        const user = await UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        // Remove propertyId from the user's bookmarks
        const index = user.bookmarks.indexOf(propertyId);
        if (index > -1) {
            user.bookmarks.splice(index, 1);
            await user.save(); // Save changes to the database
        } else {
            return res.status(404).json({ status: false, error: 'Property not found in bookmarks' });
        }

        res.json({ status: true, user });
    } catch (error) {
        console.error('Error removing bookmark:', error); // Log the error
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.getUserBookmarks = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the user from UserService
        const user = await UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        // Fetch properties by IDs in the user's bookmarks
        const propertyIds = user.bookmarks;
        if (propertyIds.length === 0) {
            return res.status(200).json({ status: true, properties: [] });
        }

        const properties = await PropertyModel.find({ '_id': { $in: propertyIds } });
        res.status(200).json({ status: true, properties });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.updateProfileCompletion = async (req, res, next) => {
    try {
        const { userId, isProfileComplete } = req.body;

        if (!userId || typeof isProfileComplete !== 'boolean') {
            return res.status(400).json({ status: false, error: 'Invalid input' });
        }

        const user = await UserService.updateProfileCompletion(userId, isProfileComplete);

        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        res.json({ status: true, message: 'Profile completion status updated', user });
    } catch (error) {
        next(error);
    }
};

exports.getUserDetails = async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Fetch user and profile details through service
      const userDetails = await UserService.fetchUserDetails(userId);
  
      // Check if user details were found
      if (!userDetails) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!userDetails.profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      res.status(200).json(userDetails);
    } catch (error) {
      console.error('Error in getUserDetails:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


exports.updateProfilePicture = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const profilePicture = req.files.find(file => file.fieldname === 'profilePicture');
        if (!profilePicture) {
            return res.status(400).json({ message: "No profile picture uploaded" });
        }

        // The path will be the Cloudinary URL now
        const profilePictureUrl = profilePicture.path;

        // Update user with the Cloudinary URL
        const updatedUser = await UserService.updateUserProfilePicture(req.params.userId, profilePictureUrl);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile picture updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Server error while updating profile picture" });
    }
};
exports.updateUserInfo = async (req, res, next) => {
    try {
        const { userId, email, role } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ status: false, error: 'UserId is required' });
        }

        // Collect updated information
        const updatedFields = {};
        if (email) updatedFields.email = email;
        if (role) updatedFields.role = role;
        

        // Call service to update the user
        const updatedUser = await UserService.updateUserInfo(userId, updatedFields);

        if (!updatedUser) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        res.json({ status: true, message: 'User information updated successfully', user: updatedUser });
    } catch (error) {
        next(error);
    }
};


exports.createRentalRequest = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        // Logic to create a rental request
        // Notify the landlord
        const landlordId = await getLandlordIdByRoomId(roomId); // Fetch landlord ID based on room
        const message = `New rental request for room ${roomId} from user ${userId}`;
        await NotificationService.createNotification(landlordId, 'request', message);
        res.status(201).json({ status: true, message: 'Rental request created and landlord notified' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await NotificationService.getNotifications(userId);
        res.status(200).json({ status: true, notifications });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ status: false, error: 'All fields are required.' });
        }

        const user = await UserService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ status: false, error: 'Current password is incorrect.' });
        }

        await UserService.updatePassword(userId, newPassword);
        res.json({ status: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ status: false, error: 'Failed to update password. Please try again.' });
    }
};
