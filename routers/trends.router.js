// Import the controller
const express = require('express');
const router = express.Router();
const trendsController = require('../controller/trends.controller');
// Define the route
router.get('/monthly-occupancy', trendsController.getMonthlyOccupancyData);
router.get('/most-viewed-property', trendsController.getMostViewedProperties); // New route

module.exports = router;