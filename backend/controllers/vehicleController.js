const Vehicle = require("../models/Vehicle");

// Add a new vehicle
const addVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            engineNumber,
            chassisNumber,
            insuranceEndDate,
            pucEndDate,
            maintenanceDate
        } = req.body;

        // Check required fields
        if (
            !registrationNumber ||
            !engineNumber ||
            !chassisNumber ||
            !insuranceEndDate ||
            !pucEndDate ||
            !maintenanceDate
        ) {
            return res.status(400).json({
                message: "Please fill all vehicle fields"
            });
        }

        // Check if registration number already exists
        const existingVehicle = await Vehicle.findOne({
            registrationNumber
        });

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle with this registration number already exists"
            });
        }

        // Create vehicle
        const vehicle = await Vehicle.create({
            businessId: req.user._id,
            registrationNumber,
            engineNumber,
            chassisNumber,
            insuranceEndDate,
            pucEndDate,
            maintenanceDate
        });

        res.status(201).json({
            message: "Vehicle added successfully",
            vehicle
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all vehicles belonging to logged-in business
const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            businessId: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: vehicles.length,
            vehicles
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get one vehicle
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            businessId: req.user._id
        });

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            vehicle
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            businessId: req.user._id
        });

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const {
            registrationNumber,
            engineNumber,
            chassisNumber,
            insuranceEndDate,
            pucEndDate,
            maintenanceDate,
            status
        } = req.body;

        vehicle.registrationNumber =
            registrationNumber ?? vehicle.registrationNumber;

        vehicle.engineNumber =
            engineNumber ?? vehicle.engineNumber;

        vehicle.chassisNumber =
            chassisNumber ?? vehicle.chassisNumber;

        vehicle.insuranceEndDate =
            insuranceEndDate ?? vehicle.insuranceEndDate;

        vehicle.pucEndDate =
            pucEndDate ?? vehicle.pucEndDate;

        vehicle.maintenanceDate =
            maintenanceDate ?? vehicle.maintenanceDate;

        vehicle.status =
            status ?? vehicle.status;

        const updatedVehicle = await vehicle.save();

        res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Deactivate vehicle
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            businessId: req.user._id
        });

        if (!vehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        // We don't actually delete it.
        // We mark it inactive.
        vehicle.status = "inactive";

        await vehicle.save();

        res.status(200).json({
            message: "Vehicle deactivated successfully",
            vehicle
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    addVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
};