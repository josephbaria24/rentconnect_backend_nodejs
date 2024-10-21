const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/payment.controller');
const upload = require('../multerConfig'); // For file uploads
const PaymentModel = require('../models/payment.model');
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


router.post('/addMonthlyPayment',upload.single('proofOfPayment'), PaymentController.addMonthlyPayment);

router.post('/createOrAddMonthlyPayment', upload.array('proofOfPayment'), PaymentController.createOrAddMonthlyPayment);
// Route to delete proof of payment for a specific month
router.delete('/room/:roomId/proofOfPayment', PaymentController.deleteProofOfPayment);

router.delete('/room/:roomId/payment/:month/proof/:type', PaymentController.deleteProof); 
router.post('/payments/updateStatus', PaymentController.updatePaymentStatus);


// router.put('/:paymentId/monthlyPayments/:monthPaymentId/status', async (req, res) => {
//     const { paymentId, monthPaymentId } = req.params;
//     const { status } = req.body; // Expect status in the request body

//     if (!['pending', 'completed', 'rejected'].includes(status)) {
//         return res.status(400).json({ message: 'Invalid status value' });
//     }

//     try {
//         // Find the payment by paymentId and then update the status of the specific monthly payment
//         const updatedPayment = await PaymentModel.findOneAndUpdate(
//             { 
//                 _id: paymentId, 
//                 'monthlyPayments._id': monthPaymentId 
//             },
//             { 
//                 $set: { 
//                     'monthlyPayments.$.status': status,
//                     'monthlyPayments.$.updated_at': Date.now()
//                 } 
//             },
//             { new: true }
//         );

//         if (!updatedPayment) {
//             return res.status(404).json({ message: 'Payment or Monthly Payment not found' });
//         }

//         res.status(200).json(updatedPayment);
//     } catch (error) {
//         console.error('Error updating monthly payment status:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


router.put('/monthlyPayments/:monthPaymentId/status', async (req, res) => {
    const { monthPaymentId } = req.params;
    const { status } = req.body; // Expect status in the request body

    if (!['pending', 'completed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        // Update the status of the specific monthly payment by its monthPaymentId
        const updatedPayment = await PaymentModel.findOneAndUpdate(
            { 'monthlyPayments._id': monthPaymentId }, // Find payment containing the monthly payment
            { 
                $set: { 
                    'monthlyPayments.$.status': status,
                    'monthlyPayments.$.updated_at': Date.now()
                } 
            },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Monthly Payment not found' });
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error('Error updating monthly payment status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
