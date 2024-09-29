const PaymentServices = require('../services/payment.services');
const PaymentModel = require('../models/payment.model')
exports.createMonthlyPayment = async (req, res) => {
    try {
        const { occupantId, landlordId, roomId, monthlyPayments } = req.body;

        if (!occupantId || !landlordId || !roomId || !monthlyPayments || monthlyPayments.length === 0) {
            return res.status(400).json({ status: false, message: "Missing required fields." });
        }

        // Check if proofOfPayment file exists
        for (const payment of monthlyPayments) {
            if (!req.file) {
                return res.status(400).json({ status: false, message: "Proof of payment is required for each payment." });
            }

            payment.proofOfPayment = req.file.path; // Save the file path or URL
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
