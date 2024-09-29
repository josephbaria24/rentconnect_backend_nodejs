const PaymentModel = require('../models/payment.model');

class PaymentServices {
    // Create or add a monthly payment record for a specific room
    static async createMonthlyPayment(paymentData) {
        const { occupantId, landlordId, roomId, month, amount, proofOfPayment } = paymentData;

        // Check if a payment record already exists for the room
        let payment = await PaymentModel.findOne({ roomId });

        if (!payment) {
            // If no payment exists, create a new payment document
            payment = new PaymentModel({
                occupantId,
                landlordId,
                roomId,
                monthlyPayments: [] // Initialize the array for monthly payments
            });
        }

        // Add the new monthly payment to the existing payment record
        const monthlyPayment = {
            month,
            amount,
            proofOfPayment,
            status: 'pending' // Initial status is 'pending' until confirmed
        };

        payment.monthlyPayments.push(monthlyPayment);

        // Save the payment record to the database
        await payment.save();
        return payment;
    }

    // Get all monthly payments for a specific room
    static async getMonthlyPaymentsByRoomId(roomId) {
        const payment = await PaymentModel.findOne({ roomId })
            .populate('occupantId landlordId') // Optional: populate occupant and landlord details
            .exec();

        if (!payment) {
            throw new Error("No payment records found for this room.");
        }

        return payment.monthlyPayments;
    }

    // Update the payment status for a specific month
    static async updatePaymentStatus(roomId, month, status) {
        const payment = await PaymentModel.findOne({ roomId });

        if (!payment) {
            throw new Error("No payment records found for this room.");
        }

        const monthlyPayment = payment.monthlyPayments.find(p => p.month === month);
        if (!monthlyPayment) {
            throw new Error(`No payment found for the month: ${month}`);
        }

        // Update the status
        monthlyPayment.status = status;
        monthlyPayment.updated_at = Date.now();

        // Save the updated payment record
        await payment.save();
        return monthlyPayment;
    }

    // Update the proof of payment (receipt photo) for a specific month
    static async updateProofOfPayment(roomId, month, proofOfPayment) {
        const payment = await PaymentModel.findOne({ roomId });

        if (!payment) {
            throw new Error("No payment records found for this room.");
        }

        const monthlyPayment = payment.monthlyPayments.find(p => p.month === month);
        if (!monthlyPayment) {
            throw new Error(`No payment found for the month: ${month}`);
        }

        // Update the proof of payment
        monthlyPayment.proofOfPayment = proofOfPayment;
        monthlyPayment.updated_at = Date.now();

        // Save the updated payment record
        await payment.save();
        return monthlyPayment;
    }
}

module.exports = PaymentServices;
