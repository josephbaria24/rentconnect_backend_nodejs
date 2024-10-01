const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/payment.controller');
const upload = require('../multerConfig'); // For file uploads

// Route to create a new monthly payment for a room
router.post('/createMonthlyPayment', upload.array('proofOfPayment'), PaymentController.createMonthlyPayment);

router.post('/uploadProofOfReservation', upload.single('proofOfReservation'), PaymentController.uploadProofOfReservation);

router.get('/room/:roomId/monthlyPayments', PaymentController.getMonthlyPaymentsByRoomId);

// Route to update payment status
router.put('/updatePaymentStatus', PaymentController.updatePaymentStatus);

// Route to update proof of payment (receipt photo)
router.put('/updateProofOfPayment', upload.single('proofOfPayment'), PaymentController.updateProofOfPayment);

// Route to get proof of reservation by room ID
router.get('/room/:roomId/proofOfReservation', PaymentController.getProofOfReservationByRoomId);


router.post('/addMonthlyPayment', PaymentController.addMonthlyPayment);


module.exports = router;
