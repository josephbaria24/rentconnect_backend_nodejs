// Import necessary modules
const express = require('express');
const router = express.Router();
const MessageModel = require('../models/meesage.model'); // Adjust path as necessary
const mongoose = require('mongoose'); 
const { ProfileModel } = require('../models/profile.model'); 
const crypto = require('crypto');
require('dotenv').config();

// Define encryption algorithm and key (store this key securely)
const algorithm = 'aes-256-cbc';
const encryptionKey = process.env.ENCRYPTION_KEY 
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
    : crypto.randomBytes(32); // Fallback to random, but should be constant in production
const ivLength = 16; // AES requires a 16-byte IV

// Function to encrypt a message
function encryptMessage(message) {
    const iv = crypto.randomBytes(ivLength); // Generate a random IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(message, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'), // Store IV as hex
        encryptedMessage: encrypted
    };
}

// Function to decrypt a message
function decryptMessage(encryptedMessage, ivHex) {
    const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex to buffer
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
// // POST route to send a message
// router.post('/messages', async (req, res) => {
//     console.log('Received message data:', req.body);
//     const { sender, recipient, content } = req.body;

//     if (!sender || !recipient || !content) {
//         return res.status(400).json({ error: 'Sender, recipient, and content are required' });
//     }

//     const newMessage = new MessageModel({ sender, recipient, content });

//     try {
//         const savedMessage = await newMessage.save();
//         res.status(200).json(savedMessage);
//     } catch (error) {
//         console.error('Error saving message:', error);
//         res.status(500).json({ error: 'Failed to save message' });
//     }
// });

router.post('/messages', async (req, res) => {
    const { sender, recipient, content } = req.body;

    if (!sender || !recipient || !content) {
        return res.status(400).json({ error: 'Sender, recipient, and content are required' });
    }

    try {
        // Encrypt the message content
        const encryptedData = encryptMessage(content);

        // Log the encrypted data and IV to ensure they are correct
        console.log('Encrypted Message:', encryptedData.encryptedMessage);
        console.log('IV:', encryptedData.iv);

        // Save encrypted message content and IV
        const newMessage = new MessageModel({
            sender,
            recipient,
            content: encryptedData.encryptedMessage,
            iv: encryptedData.iv  // Store the IV so you can decrypt it later
        });

        const savedMessage = await newMessage.save();

        // Log the saved message to verify it was saved correctly
        console.log('Saved Message:', savedMessage);

        res.status(200).json(savedMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});
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
//             ],
//             // Ensure that messages are not marked as deleted for either sender or recipient
//             $or: [
//                 { [`deleted.${sender}`]: { $ne: true } },
//                 { [`deleted.${recipient}`]: { $ne: true } }
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
            ]
        }).sort({ sentAt: 1 });

        // Decrypt the message content
        const decryptedMessages = messages.map(message => {
            // Check if content and IV exist before decrypting
            if (message.content && message.iv) {
                try {
                    return {
                        ...message._doc,
                        content: decryptMessage(message.content, message.iv)  // Decrypt the message using its IV
                    };
                } catch (err) {
                    console.error('Error decrypting message:', err);
                    return {
                        ...message._doc,
                        content: 'Error decrypting message'  // Return a fallback message if decryption fails
                    };
                }
            } else {
                // If no IV or content, return a fallback message
                return {
                    ...message._doc,
                    content: 'No content or IV available for this message'
                };
            }
        });

        res.json(decryptedMessages);
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




// // GET route to retrieve all conversations for a user
// router.get('/conversations/:userId', async (req, res) => {
//     const { userId } = req.params;

//     // Logging the received userId
//     console.log('Received UserID:', userId);
    
//     // Check if userId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.error('Invalid user ID format');
//         return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     // Convert userId to ObjectId
//     const userObjectId = new mongoose.Types.ObjectId(userId);

//     try {
//         // Aggregation pipeline to find conversations
//         const conversations = await MessageModel.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { sender: userObjectId }, 
//                         { recipient: userObjectId }
//                     ]
//                 }
//             },
//             {
//                 $sort: { sentAt: -1 } // Sort by sentAt date in descending order
//             },
//             {
//                 $group: {
//                     _id: {
//                         conversationWith: {
//                             $cond: [
//                                 { $eq: ["$sender", userObjectId] }, 
//                                 "$recipient", 
//                                 "$sender"
//                             ]
//                         }
//                     },
//                     lastMessage: { $first: "$content" },
//                     time: { $first: "$sentAt" },
//                     isRead: { $first: "$isRead" },
//                     deleted: { $first: { $ifNull: [`$deleted.${userId}`, false] } } // Check if conversation is deleted for the user
//                 }
//             },
//             {
//                 $match: {
//                     deleted: false // Only include conversations that are not marked as deleted
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users", // The users collection
//                     localField: "_id.conversationWith",
//                     foreignField: "_id",
//                     as: "userInfo"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$userInfo",
//                     preserveNullAndEmptyArrays: true // Keep records even if userInfo is not found
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "pending_request_profile", // The profiles collection
//                     localField: "userInfo._id", // Reference to the user ID
//                     foreignField: "userId", // Match with the userId in the profile
//                     as: "profileInfo"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$profileInfo",
//                     preserveNullAndEmptyArrays: true // Keep records even if profileInfo is not found
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     recipientId: "$_id.conversationWith",
//                     lastMessage: 1,
//                     time: 1,
//                     isRead: 1,
//                     profilePicture: "$userInfo.profilePicture",
//                     firstName: "$profileInfo.firstName",
//                     lastName: "$profileInfo.lastName"
//                 }
//             }
//         ]);

//         // Log the number of conversations retrieved
//         console.log('Number of conversations found:', conversations.length);

//         // Return the conversations or an empty array if none found
//         res.status(200).json(conversations);
//     } catch (error) {
//         console.error('Error fetching conversations:', error);
//         res.status(500).json({ error: 'Failed to retrieve conversations' });
//     }
// });



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
                    iv: { $first: "$iv" }, // Include the IV for decryption
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
                    iv: 1, // Include the IV for decryption
                    time: 1,
                    isRead: 1,
                    profilePicture: "$userInfo.profilePicture",
                    firstName: "$profileInfo.firstName",
                    lastName: "$profileInfo.lastName"
                }
            }
        ]);

        // Decrypt the last message for each conversation
        const decryptedConversations = conversations.map(conversation => {
            const decryptedLastMessage = decryptMessage(conversation.lastMessage, conversation.iv);
            return {
                ...conversation,
                lastMessage: decryptedLastMessage // Replace encrypted content with decrypted content
            };
        });

        // Log the number of conversations retrieved
        console.log('Number of conversations found:', decryptedConversations.length);

        // Return the decrypted conversations or an empty array if none found
        res.status(200).json(decryptedConversations);
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
