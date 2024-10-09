const mongoose = require('mongoose');
const cron = require('node-cron');
const Inquiry = require('./models/inquiries');

// Connect to MongoDB
mongoose.connect('your_mongodb_connection_string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

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
cron.schedule('* * * * *', () => {
  console.log('Checking for lapsed inquiries...');
  rejectLapsedInquiries();
});

// You can remove the Express app part if you're not using this file for web server routes
