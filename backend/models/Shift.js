const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
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

        shiftDate: {
            type: Date,
            required: true
        },

        shiftType: {
            type: String,
            enum: [
                "morning",
                "evening",
                "full-time"
            ],
            required: true
        },

        plannedStartTime: {
            type: String,
            required: true
        },

        plannedEndTime: {
            type: String,
            required: true
        },

        actualStartTime: {
            type: Date,
            default: null
        },

        actualEndTime: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                "not-started",
                "in-progress",
                "completed",
                "ended-by-business",
                "day-off"
            ],
            default: "not-started"
        },

        dayOffReason: {
            type: String,
            default: ""
        },

        dayOffAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Shift",
    shiftSchema
);