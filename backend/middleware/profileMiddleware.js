const Driver = require("../models/Driver");
const Business = require("../models/Business");


// ============================================================
// REQUIRE COMPLETE DRIVER PROFILE
// ============================================================

const requireCompleteDriverProfile = async (
    req,
    res,
    next
) => {
    try {
        const driver =
            await Driver.findById(
                req.user._id
            ).select("profileComplete");


        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }


        if (!driver.profileComplete) {
            return res.status(403).json({
                message:
                    "Please complete your profile before continuing",
                profileComplete: false
            });
        }


        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// REQUIRE COMPLETE BUSINESS PROFILE
// ============================================================

const requireCompleteBusinessProfile = async (
    req,
    res,
    next
) => {
    try {
        const business =
            await Business.findById(
                req.user._id
            ).select("profileComplete");


        if (!business) {
            return res.status(404).json({
                message: "Business not found"
            });
        }


        if (!business.profileComplete) {
            return res.status(403).json({
                message:
                    "Please complete your profile before continuing",
                profileComplete: false
            });
        }


        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    requireCompleteDriverProfile,
    requireCompleteBusinessProfile
};