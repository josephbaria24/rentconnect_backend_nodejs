const otpController = require('../controller/otp.controller');

const express = require('express');
const router = express.Router();

router.post("/otp-login", otpController.otpLogin)
router.post("/otp-verify", otpController.verifyOTP)

module.exports = router;