const router = require('express').Router();
const UserController = require('../controller/user.controller');
const upload = require('../multerConfig')

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

//router.get('/profilePicture/:userId', UserController.getProfilePicture);

module.exports = router;