const Inquiry = require('../models/inquiries'); // Ensure Inquiry model is correctly required
const PropertyModel = require('../models/properties.model');

const getMonthlyOccupancyData = async (req, res) => {
  try {
    // Fetch all inquiries
    const inquiries = await Inquiry.find();

    // Initialize an object to store monthly occupancy data
    const monthlyData = {};

    // Loop through each inquiry
    inquiries.forEach((inquiry) => {
      let relevantDate;

      // Check requestType and assign relevant date
      if (inquiry.requestType === 'rent' && inquiry.approvalDate) {
        relevantDate = new Date(inquiry.approvalDate);
      } else if (inquiry.moveInDate) {
        relevantDate = new Date(inquiry.moveInDate);
      }

      // If a relevant date exists, proceed
      if (relevantDate) {
        const year = relevantDate.getFullYear();
        const month = relevantDate.getMonth() + 1; // months are 0-indexed in JavaScript, so add 1

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


// Fetch the top 5 most viewed properties
const getMostViewedProperties = async (req, res) => {
  try {
    // Find the top 5 properties with the most views
    const mostViewedProperties = await PropertyModel.find()
      .sort({ 'views.length': -1 }) // Sort by the number of views in descending order
      .limit(5) // Limit the results to 5
      .populate('userId', 'name email') // Populate user data if needed
      .exec();

    if (!mostViewedProperties || mostViewedProperties.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }

    res.status(200).json({
      properties: mostViewedProperties,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getMonthlyOccupancyData,
  getMostViewedProperties,
};
