const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },

        recipientType: {
            type: String,
            enum: ["driver", "business"],
            required: true
        },

        type: {
            type: String,
            enum: [
                "shift_reminder",
                "shift_started",
                "shift_ended",
                "day_off",
                "payment",
                "cash_payment",
                "general"
            ],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },

        dedupeKey: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);