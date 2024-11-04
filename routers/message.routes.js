// Import necessary modules
const express = require('express');
const router = express.Router();
const MessageModel = require('../models/meesage.model'); // Adjust path as necessary
const mongoose = require('mongoose'); 
const { ProfileModel } = require('../models/profile.model'); 
// POST route to send a message
router.post('/messages', async (req, res) => {
    console.log('Received message data:', req.body);
    const { sender, recipient, content } = req.body;

    if (!sender || !recipient || !content) {
        return res.status(400).json({ error: 'Sender, recipient, and content are required' });
    }

    const newMessage = new MessageModel({ sender, recipient, content });

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Endpoint to get messages between sender and recipient
// router.get('/messages', async (req, res) => {
//     const { sender, recipient } = req.query;

//     if (!sender || !recipient) {
//         return res.status(400).json({ message: 'Sender and recipient are required' });
//     }

//     try {
//         const messages = await MessageModel.find({
//             $or: [
//                 { sender, recipient },
//                 { sender: recipient, recipient: sender }
//             ]
//         }).sort({ sentAt: 1 }); // Sort by sentAt to maintain order

//         res.json(messages);
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ message: 'Error fetching messages' });
//     }
// });

router.get('/messages', async (req, res) => {
    const { sender, recipient } = req.query;

    if (!sender || !recipient) {
        return res.status(400).json({ message: 'Sender and recipient are required' });
    }

    try {
        const messages = await MessageModel.find({
            $or: [
                { sender, recipient },
                { sender: recipient, recipient: sender }
            ],
            // Ensure that messages are not marked as deleted for either sender or recipient
            $or: [
                { [`deleted.${sender}`]: { $ne: true } },
                { [`deleted.${recipient}`]: { $ne: true } }
            ]
        }).sort({ sentAt: 1 }); // Sort by sentAt to maintain order

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});



// Mark messages as deleted for a specific user
router.patch('/messages/markAsDeleted', async (req, res) => {
    const { userId, recipientId } = req.body;

    if (!userId || !recipientId) {
        return res.status(400).json({ error: 'User ID and Recipient ID are required' });
    }

    try {
        const updatedMessages = await MessageModel.updateMany(
            {
                $or: [
                    { sender: userId, recipient: recipientId },
                    { sender: recipientId, recipient: userId }
                ]
            },
            { $set: { [`deleted.${userId}`]: true } } // Set the deleted flag for the user
        );

        if (updatedMessages.modifiedCount === 0) {
            return res.status(404).json({ message: 'No messages found for this user-recipient pair' });
        }

        res.status(200).json({ message: 'Messages marked as deleted' });
    } catch (error) {
        console.error('Error marking messages as deleted:', error);
        res.status(500).json({ error: 'Failed to mark messages as deleted' });
    }
});




// GET route to retrieve all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;

    // Logging the received userId
    console.log('Received UserID:', userId);
    
    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid user ID format');
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    try {
        // Aggregation pipeline to find conversations
        const conversations = await MessageModel.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId }, 
                        { recipient: userObjectId }
                    ]
                }
            },
            {
                $sort: { sentAt: -1 } // Sort by sentAt date in descending order
            },
            {
                $group: {
                    _id: {
                        conversationWith: {
                            $cond: [
                                { $eq: ["$sender", userObjectId] }, 
                                "$recipient", 
                                "$sender"
                            ]
                        }
                    },
                    lastMessage: { $first: "$content" },
                    time: { $first: "$sentAt" },
                    isRead: { $first: "$isRead" },
                    deleted: { $first: { $ifNull: [`$deleted.${userId}`, false] } } // Check if conversation is deleted for the user
                }
            },
            {
                $match: {
                    deleted: false // Only include conversations that are not marked as deleted
                }
            },
            {
                $lookup: {
                    from: "users", // The users collection
                    localField: "_id.conversationWith",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: {
                    path: "$userInfo",
                    preserveNullAndEmptyArrays: true // Keep records even if userInfo is not found
                }
            },
            {
                $lookup: {
                    from: "pending_request_profile", // The profiles collection
                    localField: "userInfo._id", // Reference to the user ID
                    foreignField: "userId", // Match with the userId in the profile
                    as: "profileInfo"
                }
            },
            {
                $unwind: {
                    path: "$profileInfo",
                    preserveNullAndEmptyArrays: true // Keep records even if profileInfo is not found
                }
            },
            {
                $project: {
                    _id: 0,
                    recipientId: "$_id.conversationWith",
                    lastMessage: 1,
                    time: 1,
                    isRead: 1,
                    profilePicture: "$userInfo.profilePicture",
                    firstName: "$profileInfo.firstName",
                    lastName: "$profileInfo.lastName"
                }
            }
        ]);

        // Log the number of conversations retrieved
        console.log('Number of conversations found:', conversations.length);

        // Return the conversations or an empty array if none found
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to retrieve conversations' });
    }
});





// Mark message as unread/read
router.patch('/messages/markAsUnread', async (req, res) => {
    try {
        const { recipient } = req.body; // Get recipient ID from request body

        // Find messages belonging to the recipient that should be marked as unread
        const updatedMessages = await MessageModel.updateMany(
            { recipient: recipient, isRead: true }, // Adjust the condition as necessary
            { isRead: false }, // Update the field
            { new: true } // Return the updated documents
        );

        // Check if any messages were updated
        if (updatedMessages.matchedCount === 0) {
            return res.status(404).json({ error: 'No messages found for the recipient' });
        }

        res.json({ message: 'Messages marked as unread', data: updatedMessages });
    } catch (error) {
        console.error('Error marking messages as unread:', error);
        res.status(500).json({ error: 'Failed to mark messages as unread' });
    }
});
// Mark message as unread/read
router.patch('/messages/markAsRead', async (req, res) => {
    try {
        const { recipient } = req.body; // Get recipient ID from request body

        // Find messages belonging to the recipient that should be marked as unread
        const updatedMessages = await MessageModel.updateMany(
            { recipient: recipient }, // Adjust the condition as necessary
            { isRead: true }, // Update the field
            { new: true } // Return the updated documents
        );

        // Check if any messages were updated
        if (updatedMessages.matchedCount === 0) {
            return res.status(404).json({ error: 'No messages found for the recipient' });
        }

        res.json({ message: 'Messages marked as unread', data: updatedMessages });
    } catch (error) {
        console.error('Error marking messages as unread:', error);
        res.status(500).json({ error: 'Failed to mark messages as unread' });
    }
});


module.exports = router;
