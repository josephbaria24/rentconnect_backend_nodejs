const mongoose = require('mongoose');

// Connection URL
const connectionURL = 'mongodb+srv://joseph:admin@cluster0.0tqay.mongodb.net/rentcon?retryWrites=true&w=majority&appName=Cluster0';

// Create a connection
const connection = mongoose.createConnection(connectionURL, {
    serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
});

// Event handlers
connection.on('connected', () => {
    console.log("MongoDB Connected");
});

connection.on('error', (err) => {
    console.error(`MongoDB Connection Error: ${err.message}`);
});

connection.on('disconnected', () => {
    console.log("MongoDB Disconnected");
});

module.exports = connection;
