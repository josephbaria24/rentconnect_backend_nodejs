// controllers/bookmark.controller.js
const bookmarkService = require('../services/bookmark.services');

exports.addBookmark = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const result = await bookmarkService.addBookmark(userId, propertyId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const result = await bookmarkService.removeBookmark(userId, propertyId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await bookmarkService.getBookmarks(userId);
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
