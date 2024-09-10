const UserService = require('../services/user.services');
const PropertyModel = require('../models/properties.model');
const upload = require('../multerConfig');
const path = require('path');

exports.register = async(req,res,next)=>{
    try{
        const { email, password } = req.body;

        const successRes = await UserService.registerUser(email, password);

        res.json({status:true, success:"User Registered Successfully"});
    } catch(error) {
        throw error
    }
}


exports.login = async(req,res,next)=>{
    try{
        const { email, password } = req.body;

        const user = await UserService.checkuser(email);

        if(!user){
            throw new Error('User dont exist');
        }

        const isMatch = await user.comparePassword(password);
        if(isMatch === false) {
            throw new Error('Password invalid');
        }

        let tokenData = {_id:user._id,email:user.email};
        const token = await UserService.generateToken(tokenData,"secretKey",'1h');
        res.status(200).json({status:true, token:token})

    } catch(error) {
        throw error
    }
}

exports.getUserEmailById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const user = await UserService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ status: false, error: 'User not found' });
        }

        res.json({ status: true, email: user.email });
    } catch (error) {
        next(error);
    }
};

exports.addBookmark = async (req, res, next) => {
    try {
        const { userId, propertyId } = req.body;
        const user = await UserService.addBookmark(userId, propertyId);
        res.json({ status: true, user });
    } catch (error) {
        next(error);
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

//   exports.updateProfilePicture = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const file = req.file;

//         if (!file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const profilePictureUrl = path.join('uploads', file.filename);

//         const updatedUser = await UserService.updateUserProfilePicture(userId, profilePictureUrl);

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         res.status(200).json({
//             message: 'Profile picture updated successfully',
//             user: updatedUser
//         });
//     } catch (error) {
//         console.error('Error updating profile picture:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
exports.updateProfilePicture = async (req, res) => {
    try {
        // Check if any files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Find the profile picture file in the uploaded files
        const profilePicture = req.files.find(file => file.fieldname === 'profilePicture');

        // Check if the profile picture file was uploaded
        if (!profilePicture) {
            return res.status(400).json({ message: "No profile picture uploaded" });
        }

        // Process the file (e.g., update user profile with the new profile picture)
        const userId = req.params.userId;
        const filePath = profilePicture.path;

        // Call service or directly update user document with new profile picture path
        await UserService.updateUserProfilePicture(userId, filePath);

        res.json({ message: "Profile picture updated successfully", filePath });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Server error while updating profile picture" });
    }
};
