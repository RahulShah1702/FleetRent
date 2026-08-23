const express = require("express");

const {
    getDriverProfile,
    completeDriverProfile,
    updateDriverProfile
} = require("../controllers/driverProfileController");

const {
    protect,
    driverOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get logged-in driver's profile
router.get(
    "/",
    protect,
    driverOnly,
    getDriverProfile
);


// Complete driver profile
router.put(
    "/complete",
    protect,
    driverOnly,
    completeDriverProfile
);

// Update driver profile
router.put(
    "/",
    protect,
    driverOnly,
    updateDriverProfile
);

module.exports = router;