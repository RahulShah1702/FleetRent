const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
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

        shift: {
            type: String,
            enum: ["morning", "evening", "full-time"],
            required: true
        },

        shiftStartTime: {
            type: String,
            required: true
        },

        shiftEndTime: {
            type: String,
            required: true
        },

        dailyRent: {
            type: Number,
            required: true,
            min: 0
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active"
        },

        referenceName: {
            type: String,
            trim: true
        },

        referenceMobileNumber: {
            type: String,
            trim: true,
            match: /^[6-9]\d{9}$/
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Assignment", assignmentSchema);