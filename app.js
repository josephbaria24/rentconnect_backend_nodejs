const express = require('express');
var http = require('http');
const cors = require('cors');
const app = express();
//var server = http.createServer(app);


//middleware
app.use(express.json());


// server.listen(port,()=>{
//   console.log("server started");
// });


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
//const http = require('http');
//const socketIo = require('socket.io');
const rentalAgreementRoutes = require('./routers/rentalAgreement.router')
const scheduler = require('./utils/sheduler');
const pushNotification = require('./routers/push-notification.router')
const occupant = require('./routers/occupant.routes');
const trends = require('./routers/trends.router')
const messageRoutes = require('./routers/message.routes'); // Adjust path as necessary
const smsRoute = require('./routers/sms.route'); // Adjust path as necessary
const appUpdate = require('./routers/appUpdate.routes');


const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server);
const messages = []

io.on('connection', (socket) => {
  const email = socket.handshake.query.email;
  console.log(`${email} connected`);

  // Join the user into a room using their email
  socket.join(email);

  // Listen for incoming messages
  socket.on('message', (msg) => {
    const message = {
      message: msg.message,
      sender: email,  // Get the sender's email from the socket handshake
      recipient: msg.recipient,
      sentAt: new Date(),
    };
    

    // Push message to in-memory array (or save to DB in real-world applications)
    messages.push(message);

    // Emit the message to the sender and recipient
    io.to(email).emit('message', message);  // Send message to the sender
    io.to(msg.recipient).emit('message', message);  // Send message to the recipient
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`${email} disconnected`);
  });
});


app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});



app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

//const server = http.createServer(app);
//const io = socketIo(server); // Create Socket.IO server

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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
app.use('/', appUpdate);
app.use('/', smsRoute);
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
app.use('/', messageRoutes);

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
// });
  
// Export the server and app
module.exports = { app, server, io };
