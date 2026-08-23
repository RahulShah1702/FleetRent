const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        mobileNumber: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        password: {
            type: String,
            required: function () {
                return !this.googleId;
            }
        },

        drivingLicenseNumber: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            trim: true
        },

        address: {
            type: String,
            required: false,
            trim: true
        },

        profileComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Driver", driverSchema);