const express = require("express");

const {
    getBusinessProfile,
    completeBusinessProfile,
    updateBusinessProfile
} = require("../controllers/businessProfileController");

const {
    protect,
    businessOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get logged-in business profile
router.get(
    "/",
    protect,
    businessOnly,
    getBusinessProfile
);


// Complete business profile
router.put(
    "/complete",
    protect,
    businessOnly,
    completeBusinessProfile
);

// Update business profile
router.put(
    "/",
    protect,
    businessOnly,
    updateBusinessProfile
);


module.exports = router;