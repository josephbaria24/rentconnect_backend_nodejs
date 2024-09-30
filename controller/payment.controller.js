const PaymentServices = require('../services/payment.services');
const PaymentModel = require('../models/payment.model')

exports.createMonthlyPayment = async (req, res) => {
    try {
        const { occupantId, landlordId, roomId, monthlyPayments } = req.body;

        // Ensure the required fields are provided
        if (!occupantId || !landlordId || !roomId || !monthlyPayments || monthlyPayments.length === 0) {
            return res.status(400).json({ status: false, message: "Missing required fields." });
        }

        // Check if proofOfPayment and proofOfReservation files exist
        const proofOfReservationFile = req.files.find(file => file.fieldname === 'proofOfReservation')?.path || null;

        for (const payment of monthlyPayments) {
            if (!req.files.find(file => file.fieldname === 'proofOfPayment')) {
                return res.status(400).json({ status: false, message: "Proof of payment is required for each payment." });
            }

            // Assuming req.files contains proofOfPayment
            payment.proofOfPayment = req.files.find(file => file.fieldname === 'proofOfPayment').path; // Save the proof of payment file path

            // Add the proof of reservation to the payment
            payment.proofOfReservation = proofOfReservationFile; // Save the proof of reservation file path
        }

        // Create payment record
        const newPayment = new PaymentModel({
            occupantId,
            landlordId,
            roomId,
            monthlyPayments
        });

        await newPayment.save();

        return res.status(201).json({ status: true, message: "Payment created successfully." });

    } catch (error) {
        console.error("Error creating payment:", error);
        if (!res.headersSent) {
            return res.status(500).json({ status: false, message: error.message });
        }
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
