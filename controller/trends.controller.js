// controllers/trendsController.js

const Inquiry = require('../models/inquiries'); // Ensure Inquiry model is correctly required

const getMonthlyOccupancyData = async (req, res) => {
  try {
    // Fetch all inquiries directly
    const inquiries = await Inquiry.find();

    // Initialize an object to store monthly occupancy data
    const monthlyData = {};

    // Loop through each inquiry
    inquiries.forEach((inquiry) => {
      if (inquiry.moveInDate) {
        // Extract year and month from moveInDate
        const moveInDate = new Date(inquiry.moveInDate);
        const year = moveInDate.getFullYear();
        const month = moveInDate.getMonth() + 1; // months are 0-indexed in JavaScript, so add 1

        // Create a key in the format 'YYYY-MM' for each month
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        // Increment count for this month
        if (monthlyData[monthKey]) {
          monthlyData[monthKey]++;
        } else {
          monthlyData[monthKey] = 1;
        }
      }
    });

    // Format monthlyData for visualization
    const monthlyOccupancyArray = Object.keys(monthlyData).map((key) => ({
      month: key,
      occupancyCount: monthlyData[key],
    }));

    // Sort by month for chronological order
    monthlyOccupancyArray.sort((a, b) => new Date(a.month) - new Date(b.month));

    res.status(200).json({
      monthlyOccupancyData: monthlyOccupancyArray,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMonthlyOccupancyData,
};
