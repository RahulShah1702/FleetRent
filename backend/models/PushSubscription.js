const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },

        userType: {
            type: String,
            enum: ["driver", "business"],
            required: true
        },

        endpoint: {
            type: String,
            required: true,
            unique: true
        },

        p256dh: {
            type: String,
            required: true
        },

        auth: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PushSubscription",
    pushSubscriptionSchema
);