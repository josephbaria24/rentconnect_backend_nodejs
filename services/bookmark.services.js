const BookmarkModel = require('../models/bookmark.model'); // Adjust path to your bookmark model

class BookmarkService {
    // Add a bookmark for a user
    static async addBookmark(userId, propertyId) {
        // Create a new bookmark entry
        const newBookmark = new BookmarkModel({ userId, propertyId });
        return await newBookmark.save();
    }

    // Remove a bookmark for a user
    static async removeBookmark(userId, propertyId) {
        // Remove a bookmark entry
        return await BookmarkModel.deleteOne({ userId, propertyId });
    }

    // Retrieve all bookmarks for a user
    static async getBookmarks(userId) {
        // Find all bookmark entries for a specific user
        return await BookmarkModel.find({ userId });
    }
}

module.exports = BookmarkService;
