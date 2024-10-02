const router = require('express').Router();
const UserController = require('../controller/user.controller');
const upload = require('../multerConfig')
const otpService = require('../services/otp.services')


router.post('/registration',UserController.register);
router.post('/login',UserController.login);
router.get('/getUserEmail/:userId', UserController.getUserEmailById);
router.post('/addBookmark/', UserController.addBookmark);
router.post('/removeBookmark/', UserController.removeBookmark);
router.get('/getUserBookmarks/:userId', UserController.getUserBookmarks);

router.patch('/updateProfileCompletion', UserController.updateProfileCompletion);
router.get('/user/:id', UserController.getUserDetails);
router.patch('/updateProfilePicture/:userId', upload.any(), UserController.updateProfilePicture);
router.patch('/updateUserInfo', UserController.updateUserInfo);
router.post('/createRentalRequest', UserController.createRentalRequest);
router.get('/notifications/:userId', UserController.getUserNotifications);
router.patch('/updatePassword', UserController.updatePassword);
router.post('/verify-email-otp', UserController.verifyEmailOTP);

// Resend OTP Route
router.post('/resend-otp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Call the sendOTP service function
    otpService.sendOTP({ email }, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: "Error sending OTP", error: err });
        }

        return res.status(200).json({
            message: "OTP resent successfully",
            otpHash: hash // Return the hash, which the client will store for future OTP verification
        });
    });
});


module.exports = router;