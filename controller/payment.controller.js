const PaymentServices = require('../services/payment.services');
const PaymentModel = require('../models/payment.model')
const mongoose = require('mongoose');

// exports.createMonthlyPayment = async (req, res) => {
//     try {
//         const { occupantId, landlordId, roomId, monthlyPayments } = req.body;

//         // Ensure the required fields are provided
//         if (!occupantId || !landlordId || !roomId || !monthlyPayments || monthlyPayments.length === 0) {
//             return res.status(400).json({ status: false, message: "Missing required fields." });
//         }

//         // Check if req.files is defined
//         if (!req.files) {
//             return res.status(400).json({ status: false, message: "No files uploaded." });
//         }

//         // Check if proofOfPayment files exist
//         const proofOfPaymentFiles = req.files.filter(file => file.fieldname === 'proofOfPayment');

//         for (const payment of monthlyPayments) {
//             // Check if proofOfPayment file exists for the current payment
//             const proofOfPaymentFile = proofOfPaymentFiles.find(file => file.fieldname === 'proofOfPayment');
//             if (!proofOfPaymentFile) {
//                 return res.status(400).json({ status: false, message: "Proof of payment is required for each payment." });
//             }

//             // Save the proof of payment file path
//             payment.proofOfPayment = proofOfPaymentFile.path;

//             // Add the proof of reservation to the payment only if it exists
//             const proofOfReservationFile = req.files.find(file => file.fieldname === 'proofOfReservation')?.path || null;
//             payment.proofOfReservation = proofOfReservationFile; // This will be null if not provided
//         }

//         // Create payment record
//         const newPayment = new PaymentModel({
//             occupantId,
//             landlordId,
//             roomId,
//             monthlyPayments
//         });

//         await newPayment.save();

//         return res.status(201).json({ status: true, message: "Payment created successfully." });

//     } catch (error) {
//         console.error("Error creating payment:", error);
//         if (!res.headersSent) {
//             return res.status(500).json({ status: false, message: error.message });
//         }
//     }
// };
exports.createMonthlyPayment = async (req, res) => {
    try {
        const { occupantId, landlordId, roomId, monthlyPayments } = req.body;

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
                // Ensure status is a single string and not an array
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

exports.addMonthlyPayment = async (req, res) => {
    const { paymentId, month, amount } = req.body; // Extract the fields from the request body
    const proofOfPayment = req.file ? req.file.path : null; // Access the file uploaded

    if (!paymentId || !month || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Ensure paymentId is a valid ObjectId
        const paymentObjectId = mongoose.Types.ObjectId(paymentId);

        // Create a new monthly payment object
        const newMonthlyPayment = {
            month,
            amount,
            status: 'pending', // Set the default status or adjust as needed
            proofOfPayment,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Find the payment by ID and push the new monthly payment into the array
        const updatedPayment = await PaymentModel.findByIdAndUpdate(
            paymentObjectId,
            {
                $push: {
                    monthlyPayments: newMonthlyPayment
                }
            },
            { new: true } // Return the updated document
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

// exports.addMonthlyPayment = async (req, res) => {
//     const { paymentId, month, amount, proofOfPayment } = req.body; // Ensure all required fields are provided

//     try {
//         // Create a new monthly payment object
//         const newMonthlyPayment = {
//             month,
//             amount,
//             status: 'pending', // Set the default status or adjust as needed
//             proofOfPayment,
//             created_at: new Date(),
//             updated_at: new Date()
//         };

//         // Find the payment by ID and push the new monthly payment into the array
//         const updatedPayment = await PaymentModel.findByIdAndUpdate(
//             paymentId,
//             {
//                 $push: {
//                     monthlyPayments: newMonthlyPayment
//                 }
//             },
//             { new: true } // Return the updated document
//         );

//         if (!updatedPayment) {
//             return res.status(404).json({ message: "Payment not found" });
//         }

//         return res.status(200).json({
//             message: "Monthly payment added successfully",
//             payment: updatedPayment
//         });
//     } catch (error) {
//         console.error("Error updating payment:", error);
//         return res.status(500).json({ message: "Error updating payment", error });
//     }
// };

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
