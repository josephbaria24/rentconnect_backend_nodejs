const router = require('express').Router();
const UserController = require('../controller/user.controller');

router.post('/registration',UserController.register);
router.post('/login',UserController.login);
router.get('/getUserEmail/:userId', UserController.getUserEmailById);
router.post('/addBookmark/', UserController.addBookmark);
router.post('/removeBookmark/', UserController.removeBookmark);
router.get('/getUserBookmarks/:userId', UserController.getUserBookmarks);

module.exports = router;