const mongoose = require("mongoose");

const passwordResetOtpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        role: {
            type: String,
            enum: ["driver", "business"],
            required: true
        },

        otpHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        attempts: {
            type: Number,
            default: 0
        },

        verified: {
            type: Boolean,
            default: false
        },

        resetTokenHash: {
            type: String,
            default: null
        },

        resetTokenExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

passwordResetOtpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports =
    mongoose.model(
        "PasswordResetOtp",
        passwordResetOtpSchema
    );
