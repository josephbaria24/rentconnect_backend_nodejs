// firebase.js or similar setup file
const admin = require('firebase-admin');
const serviceAccount = require('./config/rentconnectmessage-firebase-adminsdk-bd2d6-6409bd0279.json'); // Adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
