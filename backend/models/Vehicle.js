const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        engineNumber: {
            type: String,
            required: true,
            trim: true
        },

        chassisNumber: {
            type: String,
            required: true,
            trim: true
        },

        insuranceEndDate: {
            type: Date,
            required: true
        },

        pucEndDate: {
            type: Date,
            required: true
        },

        maintenanceDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);