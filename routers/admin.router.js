const express = require('express');
const AdminService = require('../services/admin.services');
const router = express.Router();

// Fetch all users with their profiles, properties, and rooms
router.get('/users/details', async (req, res) => {
    try {
        const users = await AdminService.fetchAllUsersWithDetails();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
