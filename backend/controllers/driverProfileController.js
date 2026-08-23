const Driver = require("../models/Driver");


// ============================================================
// GET DRIVER PROFILE
// ============================================================

const getDriverProfile = async (req, res) => {
    try {

        const driver = await Driver.findById(
            req.user._id
        ).select("-password");


        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }


        return res.status(200).json({
            driver
        });

    } catch (error) {

        console.error(
            "Get Driver Profile Error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// COMPLETE DRIVER PROFILE
// ============================================================

const completeDriverProfile = async (req, res) => {
    try {

        const {
            mobileNumber,
            drivingLicenseNumber,
            address
        } = req.body;


        // ====================================================
        // 1. Check required fields
        // ====================================================

        if (
            !mobileNumber ||
            !drivingLicenseNumber ||
            !address
        ) {
            return res.status(400).json({
                message:
                    "Please fill all profile fields"
            });
        }


        // ====================================================
        // 2. Find driver
        // ====================================================

        const driver = await Driver.findById(
            req.user._id
        );


        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }


        // ====================================================
        // 3. Check mobile number
        // ====================================================

        const existingMobile =
            await Driver.findOne({
                mobileNumber: mobileNumber.trim(),
                _id: {
                    $ne: driver._id
                }
            });


        if (existingMobile) {
            return res.status(400).json({
                message:
                    "Mobile number is already registered"
            });
        }


        // ====================================================
        // 4. Check driving license
        // ====================================================

        const existingLicense =
            await Driver.findOne({
                drivingLicenseNumber:
                    drivingLicenseNumber.trim().toUpperCase(),

                _id: {
                    $ne: driver._id
                }
            });


        if (existingLicense) {
            return res.status(400).json({
                message:
                    "Driving license number is already registered"
            });
        }


        // ====================================================
        // 5. Update profile
        // ====================================================

        driver.mobileNumber =
            mobileNumber.trim();

        driver.drivingLicenseNumber =
            drivingLicenseNumber
                .trim()
                .toUpperCase();

        driver.address =
            address.trim();

        driver.profileComplete =
            true;


        await driver.save();


        // ====================================================
        // 6. Return updated driver
        // ====================================================

        const updatedDriver =
            await Driver.findById(
                driver._id
            ).select("-password");


        return res.status(200).json({

            message:
                "Driver profile completed successfully",

            driver:
                updatedDriver
        });


    } catch (error) {

        console.error(
            "Complete Driver Profile Error:",
            error
        );


        if (error.code === 11000) {

            return res.status(400).json({
                message:
                    "Mobile number or driving license already exists"
            });
        }


        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ============================================================
// UPDATE DRIVER PROFILE
// ============================================================

const updateDriverProfile = async (req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            drivingLicenseNumber,
            address
        } = req.body;

        // 1. Required fields
        if (
            !fullName ||
            !mobileNumber ||
            !drivingLicenseNumber ||
            !address
        ) {
            return res.status(400).json({
                message: "Please fill all profile fields"
            });
        }

        // 2. Find driver
        const driver = await Driver.findById(
            req.user._id
        );

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        // 3. Check mobile
        const existingMobile =
            await Driver.findOne({
                mobileNumber: mobileNumber.trim(),
                _id: {
                    $ne: driver._id
                }
            });

        if (existingMobile) {
            return res.status(400).json({
                message:
                    "Mobile number is already registered"
            });
        }

        // 4. Check license
        const normalizedLicense =
            drivingLicenseNumber
                .trim()
                .toUpperCase();

        const existingLicense =
            await Driver.findOne({
                drivingLicenseNumber:
                    normalizedLicense,
                _id: {
                    $ne: driver._id
                }
            });

        if (existingLicense) {
            return res.status(400).json({
                message:
                    "Driving license number is already registered"
            });
        }

        // 5. Update
        driver.fullName =
            fullName.trim();

        driver.mobileNumber =
            mobileNumber.trim();

        driver.drivingLicenseNumber =
            normalizedLicense;

        driver.address =
            address.trim();

        driver.profileComplete =
            true;

        await driver.save();

        // 6. Return updated profile
        const updatedDriver =
            await Driver.findById(
                driver._id
            ).select("-password");

        return res.status(200).json({
            message:
                "Driver profile updated successfully",

            driver: updatedDriver
        });

    } catch (error) {
        console.error(
            "Update Driver Profile Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Mobile number or driving license already exists"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getDriverProfile,
    completeDriverProfile,
    updateDriverProfile
};