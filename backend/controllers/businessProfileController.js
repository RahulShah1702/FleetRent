const Business = require("../models/Business");


// ============================================================
// GET BUSINESS PROFILE
// ============================================================

const getBusinessProfile = async (req, res) => {
    try {
        const business = await Business.findById(
            req.user._id
        ).select("-password");

        if (!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }

        res.status(200).json({
            business
        });

    } catch (error) {
        console.error(
            "Get Business Profile Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// COMPLETE BUSINESS PROFILE
// ============================================================

const completeBusinessProfile = async (req, res) => {
    try {

        const {
            mobileNumber,
            businessName,
            fleetSize,
            city,
            state
        } = req.body;


        // ====================================================
        // 1. Validate required fields
        // ====================================================

        if (
            !mobileNumber ||
            !businessName ||
            fleetSize === undefined ||
            !city ||
            !state
        ) {
            return res.status(400).json({
                message:
                    "Please fill all profile fields"
            });
        }


        // ====================================================
        // 2. Validate fleet size
        // ====================================================

        if (
            Number.isNaN(Number(fleetSize)) ||
            Number(fleetSize) < 0
        ) {
            return res.status(400).json({
                message:
                    "Fleet size must be a valid number"
            });
        }


        // ====================================================
        // 3. Find logged-in business
        // ====================================================

        const business =
            await Business.findById(
                req.user._id
            );


        if (!business) {
            return res.status(404).json({
                message:
                    "Business not found"
            });
        }


        // ====================================================
        // 4. Check mobile number
        // ====================================================

        const existingMobile =
            await Business.findOne({
                mobileNumber,
                _id: {
                    $ne: business._id
                }
            });


        if (existingMobile) {
            return res.status(400).json({
                message:
                    "Mobile number is already registered"
            });
        }


        // ====================================================
        // 5. Update profile
        // ====================================================

        business.mobileNumber =
            mobileNumber.trim();

        business.businessName =
            businessName.trim();

        business.fleetSize =
            Number(fleetSize);

        business.city =
            city.trim();

        business.state =
            state.trim();

        business.profileComplete =
            true;


        await business.save();


        // ====================================================
        // 6. Return updated business
        // ====================================================

        const updatedBusiness =
            await Business.findById(
                business._id
            ).select("-password");


        return res.status(200).json({

            message:
                "Business profile completed successfully",

            business:
                updatedBusiness
        });


    } catch (error) {

        console.error(
            "Complete Business Profile Error:",
            error
        );


        if (error.code === 11000) {

            return res.status(400).json({
                message:
                    "Mobile number already exists"
            });
        }


        return res.status(500).json({
            message:
                "Server error"
        });
    }
};

// ============================================================
// UPDATE BUSINESS PROFILE
// ============================================================

const updateBusinessProfile = async (req, res) => {
    try {
        const {
            fullName,
            mobileNumber,
            businessName,
            fleetSize,
            city,
            state
        } = req.body;

        // 1. Required fields
        if (
            !fullName ||
            !mobileNumber ||
            !businessName ||
            fleetSize === undefined ||
            !city ||
            !state
        ) {
            return res.status(400).json({
                message: "Please fill all profile fields"
            });
        }

        // 2. Validate fleet size
        if (
            Number.isNaN(Number(fleetSize)) ||
            Number(fleetSize) < 0
        ) {
            return res.status(400).json({
                message: "Fleet size must be a valid number"
            });
        }

        // 3. Find business
        const business = await Business.findById(
            req.user._id
        );

        if (!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }

        // 4. Check mobile number
        const existingMobile =
            await Business.findOne({
                mobileNumber: mobileNumber.trim(),
                _id: {
                    $ne: business._id
                }
            });

        if (existingMobile) {
            return res.status(400).json({
                message: "Mobile number is already registered"
            });
        }

        // 5. Update
        business.fullName = fullName.trim();
        business.mobileNumber = mobileNumber.trim();
        business.businessName = businessName.trim();
        business.fleetSize = Number(fleetSize);
        business.city = city.trim();
        business.state = state.trim();

        // Keep profile complete
        business.profileComplete = true;

        await business.save();

        // 6. Return updated profile
        const updatedBusiness =
            await Business.findById(
                business._id
            ).select("-password");

        return res.status(200).json({
            message: "Business profile updated successfully",
            business: updatedBusiness
        });

    } catch (error) {
        console.error(
            "Update Business Profile Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Mobile number already exists"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getBusinessProfile,
    completeBusinessProfile,
    updateBusinessProfile
};