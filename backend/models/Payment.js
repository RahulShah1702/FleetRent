const mongoose = require("mongoose");


// ============================================================
// TRANSACTION SCHEMA
// ============================================================

const transactionSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "online"
            ],
            required: true
        },

        transactionId: {
            type: String,
            default: null
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "failed",
                "cancelled"
            ],
            default: "pending"
        },

        paidAt: {
            type: Date,
            default: null
        },

        confirmedAt: {
            type: Date,
            default: null
        }
    },
    {
        _id: true
    }
);


// ============================================================
// PAYMENT SCHEMA
// ============================================================

const paymentSchema = new mongoose.Schema(
    {
        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },

        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true
        },

        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },

        paymentDate: {
            type: Date,
            required: true
        },

        // ====================================================
        // PAYMENT AMOUNTS
        // ====================================================

        dueAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        // ====================================================
        // PAYMENT STATUS
        // ====================================================

        status: {
            type: String,
            enum: [
                "pending",
                "cash-pending",
                "partial",
                "paid"
            ],
            default: "pending"
        },

        // ====================================================
        // TRANSACTIONS
        // ====================================================

        transactions: {
            type: [
                transactionSchema
            ],
            default: []
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );