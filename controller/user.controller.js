const UserService = require('../services/user.services');
const PropertyModel = require('../models/properties.model'); 

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
        const user = await UserService.removeBookmark(userId, propertyId);
        res.json({ status: true, user });
    } catch (error) {
        next(error);
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