const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/payment.controller');
const upload = require('../multerConfig'); // For file uploads

// Route to create a new monthly payment for a room
router.post('/createMonthlyPayment', upload.single('proofOfPayment'), PaymentController.createMonthlyPayment);

// Route to get all monthly payments by room ID
router.get('/room/:roomId/monthlyPayments', PaymentController.getMonthlyPaymentsByRoomId);

// Route to update payment status
router.put('/updatePaymentStatus', PaymentController.updatePaymentStatus);

// Route to update proof of payment (receipt photo)
router.put('/updateProofOfPayment', upload.single('proofOfPayment'), PaymentController.updateProofOfPayment);

module.exports = router;
