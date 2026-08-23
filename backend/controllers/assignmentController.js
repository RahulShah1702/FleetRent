const Assignment = require("../models/Assignment");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Shift = require("../models/Shift");


// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================

const assignDriver = async (req, res) => {
    try {
        const {
            driverId,
            vehicleId,
            shift,
            shiftStartTime,
            shiftEndTime,
            dailyRent,
            startDate,
            referenceName,
            referenceMobileNumber
        } = req.body;

        // --------------------------------------------------------
        // 1. CHECK REQUIRED FIELDS
        // --------------------------------------------------------

        if (
            !driverId ||
            !vehicleId ||
            !shift ||
            !shiftStartTime ||
            !shiftEndTime ||
            dailyRent === undefined ||
            !startDate
        ) {
            return res.status(400).json({
                message:
                    "Please fill all assignment fields"
            });
        }

        // --------------------------------------------------------
        // 2. CHECK DRIVER EXISTS
        // --------------------------------------------------------

        const driver =
            await Driver.findById(driverId);

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        // --------------------------------------------------------
        // 3. CHECK VEHICLE BELONGS TO BUSINESS
        // --------------------------------------------------------

        const vehicle =
            await Vehicle.findOne({
                _id: vehicleId,
                businessId: req.user._id
            });

        if (!vehicle) {
            return res.status(404).json({
                message:
                    "Vehicle not found or does not belong to your business"
            });
        }

        // --------------------------------------------------------
        // 4. VEHICLE MUST BE ACTIVE
        // --------------------------------------------------------

        if (vehicle.status !== "active") {
            return res.status(400).json({
                message:
                    "Cannot assign driver to an inactive vehicle"
            });
        }

        // --------------------------------------------------------
        // 5. CHECK ACTIVE ASSIGNMENTS FOR VEHICLE
        // --------------------------------------------------------

        const existingAssignments =
            await Assignment.find({
                status: "active",
                vehicleId
            });

        // Full-time cannot coexist with another shift
        if (
            shift === "full-time" &&
            existingAssignments.length > 0
        ) {
            return res.status(400).json({
                message:
                    "Cannot assign full-time driver. Vehicle already has an active shift."
            });
        }

        // Same shift cannot have two drivers
        if (
            shift !== "full-time" &&
            existingAssignments.some(
                assignment =>
                    assignment.shift === shift
            )
        ) {
            return res.status(400).json({
                message:
                    `Vehicle already has a ${shift} driver`
            });
        }

        // No shift can be added when full-time exists
        if (
            existingAssignments.some(
                assignment =>
                    assignment.shift === "full-time"
            )
        ) {
            return res.status(400).json({
                message:
                    "Vehicle already has a full-time driver"
            });
        }

        // --------------------------------------------------------
        // 6. CHECK DRIVER IS NOT ALREADY ASSIGNED
        // --------------------------------------------------------

        const existingDriverAssignment =
            await Assignment.findOne({
                driverId,
                status: "active"
            });

        if (existingDriverAssignment) {
            return res.status(400).json({
                message:
                    "This driver is already assigned to an active vehicle"
            });
        }

        // --------------------------------------------------------
        // 7. CREATE ASSIGNMENT
        // --------------------------------------------------------

        const assignment =
            await Assignment.create({
                driverId,
                vehicleId,
                businessId: req.user._id,
                shift,
                shiftStartTime,
                shiftEndTime,
                dailyRent,
                startDate,
                referenceName:
                    referenceName.trim(),
                referenceMobileNumber:
                    referenceMobileNumber.replace(/\D/g, ""),
                status: "active"
            });

        return res.status(201).json({
            message:
                "Driver assigned successfully",
            assignment
        });

    } catch (error) {
        console.error(
            "Assign Driver Error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }

    // ============================================================
    // VALIDATE START DATE
    // ============================================================

    const parsedStartDate =
        new Date(
            `${startDate}T00:00:00`
        );


    if (
        Number.isNaN(
            parsedStartDate.getTime()
        )
    ) {

        return res.status(400).json({
            message:
                "Invalid start date"
        });

    }


    // Prevent past assignment dates

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    parsedStartDate.setHours(
        0,
        0,
        0,
        0
    );


    if (
        parsedStartDate <
        today
    ) {

        return res.status(400).json({
            message:
                "Start date cannot be in the past"
        });

    }
};


// ============================================================
// GET ALL ASSIGNMENTS FOR BUSINESS
// ============================================================

const getAssignments = async (req, res) => {
    try {
        const assignments =
            await Assignment.find({
                businessId: req.user._id
            })
                .populate(
                    "driverId",
                    "fullName mobileNumber email drivingLicenseNumber"
                )
                .populate(
                    "vehicleId",
                    "registrationNumber engineNumber chassisNumber status"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error(
            "Get Assignments Error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// GET CURRENT ASSIGNMENT FOR DRIVER
// ============================================================

const getMyAssignment = async (req, res) => {
    try {
        const assignment =
            await Assignment.findOne({
                driverId: req.user._id,
                status: "active"
            })
                .populate(
                    "vehicleId",
                    "registrationNumber engineNumber chassisNumber insuranceEndDate pucEndDate maintenanceDate status"
                )
                .populate(
                    "businessId",
                    "businessName fullName mobileNumber email city state"
                );

        // No active assignment is NOT a server error
        if (!assignment) {
            return res.status(200).json({
                assignment: null
            });
        }

        return res.status(200).json({
            assignment
        });

    } catch (error) {
        console.error(
            "Get My Assignment Error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// END ASSIGNMENT
// ============================================================

// ============================================================
// END ASSIGNMENT
// ============================================================

const endAssignment = async (req, res) => {

    try {

        const assignment =
            await Assignment.findOne({

                _id:
                    req.params.id,

                businessId:
                    req.user._id,

                status:
                    "active"

            });


        if (!assignment) {

            return res.status(404).json({

                message:
                    "Active assignment not found"

            });
        }


        // --------------------------------------------------------
        // END ASSIGNMENT
        // --------------------------------------------------------

        const assignmentEndTime =
            new Date();


        assignment.status =
            "completed";

        assignment.endDate =
            assignmentEndTime;


        await assignment.save();


        // --------------------------------------------------------
        // IMPORTANT:
        // IF DRIVER WAS CURRENTLY WORKING,
        // CLOSE THAT SHIFT AUTOMATICALLY.
        // --------------------------------------------------------

        const activeShift =
            await Shift.findOne({

                assignmentId:
                    assignment._id,

                driverId:
                    assignment.driverId,

                status:
                    "in-progress"

            });


        if (activeShift) {

            activeShift.actualEndTime =
                assignmentEndTime;

            activeShift.status =
                "completed";

            await activeShift.save();
        }


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(200).json({

            message:
                activeShift
                    ? "Assignment ended and active shift completed successfully"
                    : "Assignment ended successfully",

            assignment,

            shift:
                activeShift || null

        });


    } catch (error) {

        console.error(
            "End Assignment Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error"

        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    assignDriver,
    getAssignments,
    getMyAssignment,
    endAssignment
};