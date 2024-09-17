const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routers/user.router');
const propertyRouter = require('./routers/property.router');
const profileRouter = require('./routers/profile.router'); // Add this line
const roomRouter = require('./routers/room.router')
const adminRouter = require('./routers/admin.router')
const app = express();



// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Route handlers
app.use('/', userRouter);         // Prefix routes with /users
app.use('/', propertyRouter); // Prefix routes with /properties
app.use('/profile', profileRouter); // Add this line
app.use('/rooms', roomRouter);
app.use('/', adminRouter);



module.exports = app;
