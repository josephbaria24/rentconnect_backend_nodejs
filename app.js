const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routers/user.router');
const propertyRouter = require('./routers/property.router');
const bookmarkRouter = require('./routers/bookmark.router');
const profileRouter = require('./routers/profile.router'); // Add this line

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Route handlers
app.use('/', userRouter);         // Prefix routes with /users
app.use('/', propertyRouter); // Prefix routes with /properties
//app.use('/bookmarks', bookmarkRouter);  // Prefix routes with /bookmarks
app.use('/profile', profileRouter); // Add this line

// Default route (optional, for testing purposes)
// app.get('/', (req, res) => {
//   res.send('Welcome to the API!');
// });

module.exports = app;
