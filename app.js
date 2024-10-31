// // app.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const userRouter = require('./routers/user.router');
// const propertyRouter = require('./routers/property.router');
// const profileRouter = require('./routers/profile.router');
// const roomRouter = require('./routers/room.router');
// const adminRouter = require('./routers/admin.router');
// const notificationRouter = require('./routers/notification.router');
// const inquiryRoutes = require('./routers/inquiries.router');
// const paymentRouter = require('./routers/payment.router')
// const otpRouter = require('./routers/otp.routes')
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server); // Create Socket.IO server

// // Middleware to parse JSON bodies
// app.use(bodyParser.json());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// // Route handlers
// app.use('/', userRouter);
// app.use('/', propertyRouter);
// app.use('/profile', profileRouter);
// app.use('/rooms', roomRouter);
// app.use('/notification', notificationRouter);
// app.use('/', adminRouter);
// app.use('/inquiries', inquiryRoutes);
// app.use('/payment', paymentRouter);
// app.use('/', otpRouter);


// // Set the io instance in your notification service
// const notificationService = require('./services/notification.services');
// notificationService.setIoInstance(io);


// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);
  
//     // Listen for notifications and join a specific room for the user
//     socket.on('join', (userId) => {
//       socket.join(userId); // Join a room named after the userId
//       console.log(`User ${userId} joined their room`);
//     });
  
//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//     });
//   });
  
// // Export the server and app
// module.exports = { app, server, io };

// app.js
// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron'); // Import node-cron
const Inquiry = require('./models/inquiries'); // Import your Inquiry model
const db = require('./config/db'); // Import your existing database connection
const userRouter = require('./routers/user.router');
const propertyRouter = require('./routers/property.router');
const profileRouter = require('./routers/profile.router');
const roomRouter = require('./routers/room.router');
const adminRouter = require('./routers/admin.router');
const notificationRouter = require('./routers/notification.router');
const inquiryRoutes = require('./routers/inquiries.router');
const paymentRouter = require('./routers/payment.router');
const otpRouter = require('./routers/otp.routes');
const http = require('http');
const socketIo = require('socket.io');
const rentalAgreementRoutes = require('./routers/rentalAgreement.router')
const scheduler = require('./utils/sheduler');
const pushNotification = require('./routers/push-notification.router')
const occupant = require('./routers/occupant.routes');
const trends = require('./routers/trends.router')


const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Create Socket.IO server

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Reject lapsed inquiries function
const rejectLapsedInquiries = async () => {
  try {
    const currentDate = new Date();

    // Find all inquiries that have been approved
    const inquiriesToReject = await Inquiry.find({
      status: 'approved',
      approvalDate: { $exists: true },
      reservationDuration: { $exists: true },
    });

    for (const inquiry of inquiriesToReject) {
      const approvalDate = new Date(inquiry.approvalDate);
      const endDate = new Date(approvalDate);
      endDate.setDate(endDate.getDate() + inquiry.reservationDuration);

      if (currentDate > endDate) {
        inquiry.status = 'rejected';
        await inquiry.save();
        console.log(`Inquiry ${inquiry._id} has been rejected due to lapsed duration.`);
      }
    }
  } catch (error) {
    console.error('Error rejecting lapsed inquiries:', error);
  }
};

// Schedule the cron job to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Checking for lapsed inquiries...');
  rejectLapsedInquiries();
});

// Route handlers
app.use('/', userRouter);
app.use('/', propertyRouter);
app.use('/profile', profileRouter);
app.use('/rooms', roomRouter);
app.use('/notification', notificationRouter);
app.use('/', adminRouter);
app.use('/inquiries', inquiryRoutes);
app.use('/payment', paymentRouter);
app.use('/', otpRouter);
app.use('/', rentalAgreementRoutes);
app.use('/',pushNotification );
app.use('/',occupant );
app.use('/trends',trends );

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
