const PaymentServices = require('../services/payment.services');
const PaymentModel = require('../models/payment.model')
const mongoose = require('mongoose');

exports.createMonthlyPayment = async (req, res) => {
    try {
        const { occupantId, landlordId, roomId, monthlyPayments } = req.body;

        // Check if monthlyPayments is an array
        if (!Array.isArray(monthlyPayments)) {
            return res.status(400).json({ message: "monthlyPayments must be an array" });
        }

        // Process the uploaded files for proof of payment
        const proofsOfPayment = req.files.map(file => file.path); // Array of paths to uploaded files

        // Prepare the payment document
        const paymentData = {
            occupantId,
            landlordId,
            roomId,
            proofOfReservation: req.body.proofOfReservation || null,
            monthlyPayments: monthlyPayments.map((payment, index) => ({
                ...payment,
                status: Array.isArray(payment.status) ? payment.status[0] : payment.status, 
                proofOfPayment: proofsOfPayment[index] || null // Link the uploaded file, if applicable
            }))
        };

        const newPayment = new PaymentModel(paymentData);
        await newPayment.save();

        res.status(201).json({ message: "Monthly payment created successfully", payment: newPayment });
    } catch (error) {
        console.error('Error creating/updating payment:', error);
        res.status(500).json({ message: 'Error creating/updating payment', error: error.message });
    }
};




exports.updatePaymentStatus = async (req, res) => {
    const { paymentId, monthlyPaymentId, status } = req.body;

    // Log the incoming request data
    console.log('Incoming request data:');
    console.log('Payment ID:', paymentId);
    console.log('Monthly Payment ID:', monthlyPaymentId);
    console.log('Status:', status);

    // Input validation
    if (!paymentId || !monthlyPaymentId || !status) {
        return res.status(400).json({ message: "Invalid input: Missing required fields." });
    }

    try {
        // Convert IDs to ObjectId for MongoDB query
        const paymentObjectId = mongoose.Types.ObjectId(paymentId);
        const monthlyPaymentObjectId = mongoose.Types.ObjectId(monthlyPaymentId);

        // Log converted ObjectIds
        console.log('Converted Payment Object ID:', paymentObjectId);
        console.log('Converted Monthly Payment Object ID:', monthlyPaymentObjectId);

        // Find the specific payment record by its ID and the monthly payment by its sub-document ID
        const payment = await PaymentModel.findOne({
            _id: paymentObjectId,
            'monthlyPayments._id': monthlyPaymentObjectId
        });

        // Log the retrieved payment
        console.log('Retrieved payment:', payment);

        // Check if payment record exists
        if (!payment) {
            console.log(`No payment records found for Payment ID: ${paymentId}, Monthly Payment ID: ${monthlyPaymentId}`);
            return res.status(404).json({ message: "Payment not found" });
        }

        // Update the status of the specific monthly payment inside the array
        const updateResult = await PaymentModel.updateOne(
            { _id: paymentObjectId, 'monthlyPayments._id': monthlyPaymentObjectId },
            {
                $set: {
                    'monthlyPayments.$.status': status,
                    'monthlyPayments.$.updated_at': new Date() // Update timestamp
                }
            }
        );

        // Check if the update was successful
        if (updateResult.nModified === 0) {
            console.log(`No updates were made for Payment ID: ${paymentId}, Monthly Payment ID: ${monthlyPaymentId}`);
            return res.status(400).json({ message: "No updates made to the payment status." });
        }

        res.status(200).json({
            message: "Payment status updated successfully",
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status', error: error.message });
    }
};


exports.createOrAddMonthlyPayment = async (req, res) => {
    const { occupantId, landlordId, roomId, monthlyPayments } = req.body;
    const proofsOfPayment = req.files.map(file => file.path); // Process the proof of payment files

    try {
        // First, check if the payment already exists for the occupant and room
        let existingPayment = await PaymentModel.findOne({ occupantId, roomId });

        if (existingPayment) {
            // If a payment record exists, call `addMonthlyPayment` instead of creating a new one
            const newMonthlyPayment = {
                month: monthlyPayments[0].month, // Assuming you're passing the month
                amount: monthlyPayments[0].amount, // Assuming amount is in the array
                proofOfPayment: proofsOfPayment[0] || null,
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            };

            // Push the new payment into the existing document
            existingPayment.monthlyPayments.push(newMonthlyPayment);
            await existingPayment.save();

            return res.status(200).json({
                message: "Monthly payment added successfully",
                payment: existingPayment
            });

        } else {
            // If no payment exists, create a new payment with initial monthly payment
            const paymentData = {
                occupantId,
                landlordId,
                roomId,
                proofOfReservation: req.body.proofOfReservation || null,
                monthlyPayments: monthlyPayments.map((payment, index) => ({
                    ...payment,
                    status: 'pending', // Default status
                    proofOfPayment: proofsOfPayment[index] || null
                }))
            };

            const newPayment = new PaymentModel(paymentData);
            await newPayment.save();

            res.status(201).json({ message: "Monthly payment created successfully", payment: newPayment });
        }
    } catch (error) {
        console.error('Error creating or adding payment:', error);
        res.status(500).json({ message: 'Error creating or adding payment', error: error.message });
    }
};


exports.addMonthlyPayment = async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    const { paymentId, month, amount } = req.body; // Access fields from the request body
    const proofOfPayment = req.file ? req.file.path : null; // Access the uploaded file path

    // Ensure all required fields are provided
    if (!paymentId || !month || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const newMonthlyPayment = {
            month,
            amount,
            proofOfPayment,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };

        const updatedPayment = await PaymentModel.findByIdAndUpdate(
            paymentId,
            {
                $push: {
                    monthlyPayments: newMonthlyPayment
                }
            },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({
            message: "Monthly payment added successfully",
            payment: updatedPayment
        });
    } catch (error) {
        console.error("Error updating payment:", error);
        return res.status(500).json({ message: "Error updating payment", error });
    }
};




exports.getMonthlyPaymentsByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const monthlyPayments = await PaymentServices.getMonthlyPaymentsByRoomId(roomId);

        res.status(200).json({ status: true, monthlyPayments });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { roomId, month, status } = req.body;

        const updatedPayment = await PaymentServices.updatePaymentStatus(roomId, month, status);

        res.status(200).json({ status: true, message: "Payment status updated", payment: updatedPayment });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
};

exports.updateProofOfPayment = async (req, res) => {
    try {
        const { roomId, month } = req.body;
        const proofOfPayment = req.file ? req.file.path : null; // Handle the uploaded proof of payment

        const updatedPayment = await PaymentServices.updateProofOfPayment(roomId, month, proofOfPayment);

        res.status(200).json({ status: true, message: "Proof of payment updated", payment: updatedPayment });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
};



exports.uploadProofOfReservation = async (req, res) => {
    try {
        const { occupantId, roomId, landlordId } = req.body; // Extract landlordId here

        if (!occupantId || !roomId || !landlordId) {
            return res.status(400).json({ status: false, message: "Occupant ID, Room ID, and Landlord ID are required." });
        }

        // Check if proofOfReservation file exists
        if (!req.file) {
            return res.status(400).json({ status: false, message: "Proof of reservation payment is required." });
        }

        // Try to find the payment record
        let payment = await PaymentModel.findOne({ occupantId, roomId });

        // If no payment record exists, create one
        if (!payment) {
            payment = new PaymentModel({
                occupantId,
                landlordId, // Use landlordId from request body
                roomId,
                monthlyPayments: [] // Initialize with an empty array if needed
            });
        }

        // Update the payment document with the proof of reservation
        payment.proofOfReservation = req.file.path; // Save the file path or URL
        await payment.save();

        return res.status(200).json({ status: true, message: "Proof of reservation uploaded successfully." });

    } catch (error) {
        console.error("Error uploading proof of reservation:", error);
        if (!res.headersSent) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
};

 exports.getProofOfReservationByRoomId = async (req, res) => {
    const { roomId } = req.params;

    try {
      const room = await PaymentModel.findOne({ roomId }).select('proofOfReservation'); // Adjust as necessary

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      res.json({
        proofOfReservation: room.proofOfReservation || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  exports.deleteProofOfPayment = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { month } = req.body;

        // Find the payment record for the room
        const payment = await PaymentModel.findOne({ roomId });

        if (!payment) {
            return res.status(404).json({ message: 'No payment records found for this room.' });
        }

        // Find the specific monthly payment by month
        const monthlyPayment = payment.monthlyPayments.find(p => p.month === month);
        if (!monthlyPayment) {
            return res.status(404).json({ message: `No payment found for the month: ${month}` });
        }

        // Delete the proof of payment
        monthlyPayment.proofOfPayment = null;
        monthlyPayment.updated_at = Date.now();

        // Save the updated payment record
        await payment.save();

        res.status(200).json({ message: 'Proof of payment deleted successfully', payment });
    } catch (error) {
        console.error('Error deleting proof of payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProof = async (req, res) => {
    const { roomId, month, type } = req.params;

    try {
        // Find the payment record by roomId
        const paymentRecord = await PaymentModel.findOne({ roomId });

        if (!paymentRecord) {
            return res.status(404).json({ status: false, message: 'Payment not found.' });
        }

        if (type === 'reservation') {
            // Delete proof of reservation
            if (paymentRecord.proofOfReservation) {
                paymentRecord.proofOfReservation = null;
                await paymentRecord.save();
                return res.json({ status: true, message: 'Proof of reservation deleted successfully.' });
            } else {
                return res.status(404).json({ status: false, message: 'Proof of reservation does not exist.' });
            }
        } else if (type === 'payment') {
            // Delete proof of payment for the specified month
            const monthlyPayment = paymentRecord.monthlyPayments.find(mp => mp.month === month);

            if (monthlyPayment && monthlyPayment.proofOfPayment) {
                monthlyPayment.proofOfPayment = null;
                await paymentRecord.save();
                return res.json({ status: true, message: 'Proof of payment deleted successfully.' });
            } else {
                return res.status(404).json({ status: false, message: 'Proof of payment for this month does not exist.' });
            }
        } else {
            return res.status(400).json({ status: false, message: 'Invalid proof type.' });
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server error', error });
    }
};

