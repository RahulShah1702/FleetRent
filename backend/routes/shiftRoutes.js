const express = require("express");

const {
    startShift,
    endShift,
    getMyShiftHistory,
    getBusinessShifts,
    getVehicleShiftHistory,
    takeDayOff
} = require("../controllers/shiftController");

const {
    protect,
    driverOnly,
    businessOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Driver starts shift
router.post(
    "/start",
    protect,
    driverOnly,
    startShift
);


// Driver ends shift
router.put(
    "/end",
    protect,
    driverOnly,
    endShift
);


// Get driver's shift history
router.get(
    "/my-history",
    protect,
    driverOnly,
    getMyShiftHistory
);


// Get business's shift history
router.get(
    "/business",
    protect,
    businessOnly,
    getBusinessShifts
);


// Get shift/assignment history for a vehicle
router.get(
    "/vehicle/:vehicleId/history",
    protect,
    businessOnly,
    getVehicleShiftHistory
);

// Driver takes a day off
router.post(
    "/day-off",
    protect,
    driverOnly,
    takeDayOff
);

module.exports = router;