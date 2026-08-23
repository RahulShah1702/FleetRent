const express = require("express");

const {
    requireCompleteBusinessProfile
} = require("../middleware/profileMiddleware");

const {
    addVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");

const {
    protect,
    businessOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Add vehicle
router.post(
    "/",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    addVehicle
);


// Get all vehicles
router.get(
    "/",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    getVehicles
);


// Get one vehicle
router.get(
    "/:id",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    getVehicleById
);


// Update vehicle
router.put(
    "/:id",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    updateVehicle
);


// Deactivate vehicle
router.delete(
    "/:id",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    deleteVehicle
);


module.exports = router;