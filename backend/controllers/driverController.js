const bcrypt = require("bcryptjs");
const Driver = require("../models/Driver");
const generateToken = require("../utils/generateToken");


// ============================================================
// REGISTER DRIVER
// ============================================================

const registerDriver = async (req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            email,
            password,
            confirmPassword,
            drivingLicenseNumber,
            address
        } = req.body;


        // 1. Check required fields
        if (
            !fullName ||
            !mobileNumber ||
            !email ||
            !password ||
            !confirmPassword ||
            !drivingLicenseNumber ||
            !address
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


        // 3. Check if driver already exists
        const existingDriver = await Driver.findOne({
            $or: [
                { email: email.toLowerCase() },
                { mobileNumber },
                { drivingLicenseNumber }
            ]
        });


        if (existingDriver) {
            return res.status(400).json({
                message: "Driver already exists"
            });
        }


        // 4. Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // 5. Create driver
        const driver = await Driver.create({
            fullName,
            mobileNumber,
            email: email.toLowerCase(),
            password: hashedPassword,
            drivingLicenseNumber,
            address,

            // Normal registration is complete
            profileComplete: true
        });


        // 6. Generate token
        const token = generateToken(
            driver._id,
            "driver"
        );


        // 7. Send response
        res.status(201).json({
            message: "Driver registered successfully",

            token,

            driver: {
                id: driver._id,
                fullName: driver.fullName,
                email: driver.email,
                mobileNumber: driver.mobileNumber,
                profileComplete: driver.profileComplete
            }
        });

    } catch (error) {
        console.error("Driver Registration Error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email, mobile number or driving license already exists"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// LOGIN DRIVER
// ============================================================

const loginDriver = async (req, res) => {
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


        // 2. Find driver
        const driver = await Driver.findOne({
            mobileNumber
        });


        if (!driver) {
            return res.status(401).json({
                message:
                    "Invalid mobile number or password"
            });
        }


        // 3. Check whether password exists
        // Google-only accounts don't have a password.
        if (!driver.password) {
            return res.status(401).json({
                message:
                    "This account uses Google login. Please continue with Google."
            });
        }


        // 4. Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                driver.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid mobile number or password"
            });
        }


        // 5. Generate token
        const token = generateToken(
            driver._id,
            "driver"
        );


        // 6. Send response
        res.status(200).json({
            message: "Driver login successful",

            token,

            driver: {
                id: driver._id,
                fullName: driver.fullName,
                email: driver.email,
                mobileNumber: driver.mobileNumber,
                profileComplete: driver.profileComplete
            }
        });

    } catch (error) {
        console.error("Driver Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// GET DRIVERS
// ============================================================

const getDrivers = async (req, res) => {
    try {
        const search = req.query.search || "";


        const drivers = await Driver.find({
            $or: [
                {
                    fullName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    mobileNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    drivingLicenseNumber: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        })
            .select("-password")
            .sort({
                createdAt: -1
            });


        res.status(200).json({
            count: drivers.length,
            drivers
        });

    } catch (error) {
        console.error("Get Drivers Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ============================================================
// SEARCH AVAILABLE DRIVERS
// Global driver search
// Only drivers without an active assignment are returned
// ============================================================

const searchAvailableDrivers = async (req, res) => {

    try {

        const Driver = require("../models/Driver");
        const Assignment = require("../models/Assignment");

        const search =
            (req.query.search || "")
                .trim();

        // --------------------------------------------------------
        // Find drivers who already have an active assignment
        // --------------------------------------------------------

        const activeAssignments =
            await Assignment.find(
                {
                    status: "active"
                }
            ).select("driverId");

        const assignedDriverIds =
            activeAssignments.map(
                (assignment) =>
                    assignment.driverId
            );


        // --------------------------------------------------------
        // Build search condition
        // --------------------------------------------------------

        const searchCondition = {

            _id: {
                $nin:
                    assignedDriverIds
            }

        };


        // --------------------------------------------------------
        // If user typed something, search globally
        // --------------------------------------------------------

        if (search) {

            searchCondition.$or = [

                {
                    fullName: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    mobileNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    drivingLicenseNumber: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }


        // --------------------------------------------------------
        // Get available drivers
        // --------------------------------------------------------

        const drivers =
            await Driver.find(
                searchCondition
            )
                .select(
                    "fullName mobileNumber email drivingLicenseNumber"
                )
                .sort({
                    fullName: 1
                })
                .limit(20);


        res.status(200).json({

            count:
                drivers.length,

            drivers

        });


    } catch (error) {

        console.error(
            "Search Available Drivers Error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to search available drivers."

        });

    }

};


module.exports = {
    registerDriver,
    loginDriver,
    getDrivers,
    searchAvailableDrivers
};