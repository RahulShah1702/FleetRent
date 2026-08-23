const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
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

        businessName: {
            type: String,
            required: false,
            trim: true
        },

        fleetSize: {
            type: Number,
            required: false,
            min: 0
        },

        city: {
            type: String,
            required: false,
            trim: true
        },

        state: {
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

module.exports = mongoose.model("Business", businessSchema);