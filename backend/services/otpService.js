const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

const generateOtp = () =>
    String(
        crypto.randomInt(
            0,
            1000000
        )
    ).padStart(6, "0");

const hashValue = (value) =>
    crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

const generateResetToken = () =>
    crypto
        .randomBytes(32)
        .toString("hex");

const getOtpExpiry = () =>
    new Date(
        Date.now() +
        OTP_EXPIRY_MINUTES * 60 * 1000
    );

module.exports = {
    generateOtp,
    hashValue,
    generateResetToken,
    getOtpExpiry,
    OTP_EXPIRY_MINUTES,
    MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS
};
