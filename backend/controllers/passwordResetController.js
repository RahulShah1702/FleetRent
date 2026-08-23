const bcrypt = require("bcryptjs");

const Driver =
    require("../models/Driver");

const Business =
    require("../models/Business");

const PasswordResetOtp =
    require("../models/PasswordResetOtp");

const {
    generateOtp,
    hashValue,
    generateResetToken,
    getOtpExpiry,
    MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS
} =
    require("../services/otpService");

const sendEmailOtp =
    require("../services/emailService");


const getModelForRole = (
    role
) => {

    if (role === "driver") {
        return Driver;
    }

    if (role === "business") {
        return Business;
    }

    return null;
};


const normalizeEmail = (
    email
) =>
    String(email || "")
        .trim()
        .toLowerCase();


const genericResponse = () => ({
    message:
        "If an account exists for this email address, an OTP has been sent."
});


const requestOtp =
    async (req, res) => {

        try {

            const {
                email,
                role
            } = req.body;

            const normalizedEmail =
                normalizeEmail(email);

            const Model =
                getModelForRole(role);

            if (
                !Model ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(normalizedEmail)
            ) {

                return res.status(400).json({
                    message:
                        "Enter a valid email address and account type."
                });

            }

            const user =
                await Model.findOne({
                    email: normalizedEmail
                });

            // Avoid account enumeration.
            if (!user) {
            
                return res.status(404).json({
                    message:
                        `No ${role} account was found with this email address.`
                });
            
            }

            const latestOtp =
                await PasswordResetOtp.findOne({
                    email: normalizedEmail,
                    role
                }).sort({
                    createdAt: -1
                });

            if (
                latestOtp &&
                Date.now() -
                    new Date(
                        latestOtp.createdAt
                    ).getTime() <
                    OTP_RESEND_COOLDOWN_SECONDS *
                    1000
            ) {

                return res.status(429).json({
                    message:
                        "Please wait before requesting another OTP."
                });

            }

            const otp =
                generateOtp();

            await PasswordResetOtp.deleteMany({
                email: normalizedEmail,
                role
            });

            await PasswordResetOtp.create({

                email: normalizedEmail,
                role,
                otpHash: hashValue(otp),
                expiresAt: getOtpExpiry(),
                attempts: 0,
                verified: false

            });

            await sendEmailOtp({
                email: normalizedEmail,
                role,
                otp
            });

            return res
                .status(200)
                .json(
                    genericResponse()
                );

        } catch (error) {

            console.error(
                "Request Email OTP Error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to send OTP email."
            });
        }
    };


const verifyOtp =
    async (req, res) => {

        try {

            const {
                email,
                role,
                otp
            } = req.body;

            const normalizedEmail =
                normalizeEmail(email);

            if (
                !normalizedEmail ||
                !role ||
                !otp
            ) {

                return res.status(400).json({
                    message:
                        "Invalid OTP request."
                });

            }

            const record =
                await PasswordResetOtp.findOne({
                    email: normalizedEmail,
                    role
                }).sort({
                    createdAt: -1
                });

            if (!record) {

                return res.status(400).json({
                    message:
                        "OTP expired or not found."
                });

            }

            if (
                record.expiresAt <
                new Date()
            ) {

                return res.status(400).json({
                    message:
                        "OTP has expired."
                });

            }

            if (
                record.attempts >=
                MAX_ATTEMPTS
            ) {

                return res.status(429).json({
                    message:
                        "Too many incorrect attempts."
                });

            }

            const suppliedHash =
                hashValue(
                    String(
                        otp
                    ).trim()
                );

            if (
                suppliedHash !==
                record.otpHash
            ) {

                record.attempts += 1;
                await record.save();

                return res.status(400).json({
                    message:
                        "Invalid OTP."
                });

            }

            const resetToken =
                generateResetToken();

            record.verified =
                true;

            record.resetTokenHash =
                hashValue(resetToken);

            record.resetTokenExpiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            await record.save();

            return res.status(200).json({
                message:
                    "OTP verified successfully.",
                resetToken
            });

        } catch (error) {

            console.error(
                "Verify OTP Error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to verify OTP."
            });

        }
    };


const resetPassword =
    async (req, res) => {

        try {

            const {
                role,
                resetToken,
                password,
                confirmPassword
            } = req.body;

            if (
                !role ||
                !resetToken ||
                !password ||
                !confirmPassword
            ) {

                return res.status(400).json({
                    message:
                        "Please fill all password fields."
                });

            }

            if (
                password !==
                confirmPassword
            ) {

                return res.status(400).json({
                    message:
                        "Passwords do not match."
                });

            }

            if (
                password.length <
                6
            ) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters."
                });

            }

            const record =
                await PasswordResetOtp.findOne({

                    role,
                    verified: true,

                    resetTokenHash:
                        hashValue(
                            resetToken
                        ),

                    resetTokenExpiresAt: {
                        $gt:
                            new Date()
                    }

                });

            if (!record) {

                return res.status(400).json({
                    message:
                        "Reset session expired. Please request a new OTP."
                });

            }

            const Model =
                getModelForRole(role);

            if (!Model) {

                return res.status(400).json({
                    message:
                        "Invalid account type."
                });

            }

            const user =
                await Model.findOne({
                    email: record.email
                });

            if (!user) {

                return res.status(400).json({
                    message:
                        "Account not found."
                });

            }

            user.password =
                await bcrypt.hash(
                    password,
                    10
                );

            await user.save();

            await PasswordResetOtp.deleteOne({
                _id: record._id
            });

            return res.status(200).json({
                message:
                    "Password reset successfully."
            });

        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to reset password."
            });

        }
    };


module.exports = {
    requestOtp,
    verifyOtp,
    resetPassword
};
