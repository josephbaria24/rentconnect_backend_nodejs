const express = require('express');
const bookmarkController = require('../controller/bookmark.controller');
const router = express.Router();

router.post('/add', bookmarkController.addBookmark);
router.post('/remove', bookmarkController.removeBookmark);
router.get('/:userId', bookmarkController.getBookmarks);

module.exports = router;
