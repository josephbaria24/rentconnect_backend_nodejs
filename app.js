// app.js
const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routers/user.router');
const propertyRouter = require('./routers/property.router');
const profileRouter = require('./routers/profile.router');
const roomRouter = require('./routers/room.router');
const adminRouter = require('./routers/admin.router');
const notificationRouter = require('./routers/notification.router');
const inquiryRoutes = require('./routers/inquiries.router');
const paymentRouter = require('./routers/payment.router')
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Create Socket.IO server

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Route handlers
app.use('/', userRouter);
app.use('/', propertyRouter);
app.use('/profile', profileRouter);
app.use('/rooms', roomRouter);
app.use('/notification', notificationRouter);
app.use('/', adminRouter);
app.use('/inquiries', inquiryRoutes);
app.use('/payment', paymentRouter);

// Set the io instance in your notification service
const notificationService = require('./services/notification.services');
notificationService.setIoInstance(io);


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Listen for notifications and join a specific room for the user
    socket.on('join', (userId) => {
      socket.join(userId); // Join a room named after the userId
      console.log(`User ${userId} joined their room`);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
// Export the server and app
module.exports = { app, server, io };
