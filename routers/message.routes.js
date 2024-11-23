// Import necessary modules
const express = require('express');
const router = express.Router();
const MessageModel = require('../models/meesage.model'); // Adjust path as necessary
const mongoose = require('mongoose'); 
const { ProfileModel } = require('../models/profile.model'); 
const crypto = require('crypto');
require('dotenv').config();
const { toZonedTime, format } = require('date-fns-tz');
const dateFnsTz = require('date-fns-tz');
console.log('date-fns-tz:', dateFnsTz);
console.log('toZonedTime:', typeof toZonedTime); // Should log: function
console.log('format:', typeof format); // Should log: function


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

        // Set the current time in the correct timezone
        const sentAt = toZonedTime(new Date(), timeZone);  // Get current date and convert to the specified timezone

        // Save encrypted message content and IV along with the correct time
        const newMessage = new MessageModel({
            sender,
            recipient,
            content: encryptedData.encryptedMessage,
            iv: encryptedData.iv,  // Store the IV for decryption
            sentAt: sentAt // Store the adjusted sentAt time
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

        // Decrypt the message content and format the time
        const decryptedMessages = messages.map(message => {
            // Check if content and IV exist before decrypting
            let decryptedMessage = {
                ...message._doc,
                content: 'No content or IV available for this message'  // Default message if no content or IV
            };

            if (message.content && message.iv) {
                try {
                    decryptedMessage = {
                        ...message._doc,
                        content: decryptMessage(message.content, message.iv)  // Decrypt the message
                    };
                } catch (err) {
                    console.error('Error decrypting message:', err);
                    decryptedMessage.content = 'Error decrypting message';  // Fallback message
                }
            }

            // Convert and format the sentAt time to 12-hour format (AM/PM)
            const zonedTime = toZonedTime(message.sentAt, timeZone);
            const formattedTime = format(zonedTime, 'yyyy-MM-dd hh:mm:ss a', { timeZone }); // 12-hour format with AM/PM

            // Attach the formatted time to the decrypted message
            decryptedMessage.time = formattedTime;

            return decryptedMessage;
        });

        res.json(decryptedMessages);  // Return the decrypted messages with formatted time
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

// Example timezone: replace 'Asia/Manila' with your desired timezone
const timeZone = 'Asia/Manila';

// Example UTC timestamp (sentAt)
const sentAt = '2024-11-21T11:40:06.675+00:00';

// Convert to Date object
const utcDate = new Date(sentAt); // Make sure this is a valid Date object

// Adjust the time to the desired time zone
const zonedTime = toZonedTime(utcDate, timeZone); // Convert UTC to Asia/Manila time zone

// Format the time in a readable way
const formattedTime = format(zonedTime, 'yyyy-MM-dd HH:mm:ss zzzz', { timeZone });

console.log('Formatted Time:', formattedTime);
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

        // Decrypt the last message and format the time for each conversation
        const decryptedConversations = conversations.map(conversation => {
            const decryptedLastMessage = decryptMessage(conversation.lastMessage, conversation.iv);
            
            // Convert and format the time to 12-hour format (AM/PM)
            const zonedTime = toZonedTime(conversation.time, timeZone);
            const formattedTime = format(zonedTime, 'hh:mm a', { timeZone }); // 12-hour format with AM/PM
            
            return {
                ...conversation,
                lastMessage: decryptedLastMessage,
                time: formattedTime, // Set the formatted time here
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
