const express = require("express");

const {
    assignDriver,
    getAssignments,
    getMyAssignment,
    endAssignment
} = require("../controllers/assignmentController");

const {
    protect,
    businessOnly,
    driverOnly
} = require("../middleware/authMiddleware");

const {
    requireCompleteBusinessProfile,
    requireCompleteDriverProfile
} = require("../middleware/profileMiddleware");

const router = express.Router();


// Assign driver to vehicle
router.post(
    "/",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    assignDriver
);


// Get all assignments for business
router.get(
    "/",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    getAssignments
);

// Get current assignment for driver
router.get(
    "/my",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    getMyAssignment
);

// End assignment by business
router.put(
    "/:id/end",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    endAssignment
);


module.exports = router;