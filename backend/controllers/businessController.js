const bcrypt = require("bcryptjs");
const Business = require("../models/Business");
const generateToken = require("../utils/generateToken");


// ============================================================
// REGISTER BUSINESS
// ============================================================

const registerBusiness = async (req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            email,
            password,
            confirmPassword,
            businessName,
            fleetSize,
            city,
            state
        } = req.body;


        // 1. Check required fields
        if (
            !fullName ||
            !mobileNumber ||
            !email ||
            !password ||
            !confirmPassword ||
            !businessName ||
            fleetSize === undefined ||
            !city ||
            !state
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }


        // 2. Check passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }


        // 3. Check existing business
        const existingBusiness =
            await Business.findOne({
                $or: [
                    {
                        email:
                            email.toLowerCase()
                    },
                    {
                        mobileNumber
                    }
                ]
            });


        if (existingBusiness) {
            return res.status(400).json({
                message:
                    "Business account already exists"
            });
        }


        // 4. Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // 5. Create business
        const business =
            await Business.create({
                fullName,
                mobileNumber,
                email:
                    email.toLowerCase(),
                password:
                    hashedPassword,

                businessName,
                fleetSize,
                city,
                state,

                // Normal registration is complete
                profileComplete: true
            });


        // 6. Generate token
        const token =
            generateToken(
                business._id,
                "business"
            );


        // 7. Send response
        res.status(201).json({
            message:
                "Business registered successfully",

            token,

            business: {
                id: business._id,
                fullName:
                    business.fullName,
                businessName:
                    business.businessName,
                email:
                    business.email,
                mobileNumber:
                    business.mobileNumber,
                profileComplete:
                    business.profileComplete
            }
        });

    } catch (error) {
        console.error(
            "Business Registration Error:",
            error
        );

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Email or mobile number already exists"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// LOGIN BUSINESS
// ============================================================

const loginBusiness = async (req, res) => {
    try {
        const {
            mobileNumber,
            password
        } = req.body;


        // 1. Check fields
        if (!mobileNumber || !password) {
            return res.status(400).json({
                message:
                    "Please enter mobile number and password"
            });
        }


        // 2. Find business
        const business =
            await Business.findOne({
                mobileNumber
            });


        if (!business) {
            return res.status(401).json({
                message:
                    "Invalid mobile number or password"
            });
        }


        // 3. Check whether password exists
        // Google-only accounts don't have a password.
        if (!business.password) {
            return res.status(401).json({
                message:
                    "This account uses Google login. Please continue with Google."
            });
        }


        // 4. Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                business.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid mobile number or password"
            });
        }


        // 5. Generate token
        const token =
            generateToken(
                business._id,
                "business"
            );


        // 6. Send response
        res.status(200).json({
            message:
                "Business login successful",

            token,

            business: {
                id: business._id,
                fullName:
                    business.fullName,
                businessName:
                    business.businessName,
                email:
                    business.email,
                mobileNumber:
                    business.mobileNumber,
                profileComplete:
                    business.profileComplete
            }
        });

    } catch (error) {
        console.error(
            "Business Login Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    registerBusiness,
    loginBusiness
};