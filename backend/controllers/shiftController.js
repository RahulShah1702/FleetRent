const Shift = require("../models/Shift");
const Assignment = require("../models/Assignment");
const Vehicle = require("../models/Vehicle");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const createNotification = require("../utils/createNotification");


// ============================================================
// START TODAY'S SHIFT
// ============================================================

const startShift = async (req, res) => {
    try {

        // --------------------------------------------------------
        // FIND DRIVER'S CURRENT ACTIVE ASSIGNMENT
        // --------------------------------------------------------

        const assignment = await Assignment.findOne({
            driverId: req.user._id,
            status: "active"
        });

        if (!assignment) {
            return res.status(404).json({
                message: "No active assignment found"
            });
        }


        // --------------------------------------------------------
        // TODAY
        // --------------------------------------------------------

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);


        // --------------------------------------------------------
        // CHECK TODAY'S SHIFT FOR THIS ASSIGNMENT
        //
        // IMPORTANT:
        // We MUST check assignmentId.
        // --------------------------------------------------------

        const existingShift = await Shift.findOne({
            assignmentId: assignment._id,
            driverId: req.user._id,
            shiftDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingShift) {
            return res.status(400).json({
                message: "Today's shift has already been created",
                shift: existingShift
            });
        }


        // --------------------------------------------------------
        // CREATE TODAY'S SHIFT
        // --------------------------------------------------------

        const shift = await Shift.create({

            assignmentId:
                assignment._id,

            driverId:
                assignment.driverId,

            vehicleId:
                assignment.vehicleId,

            businessId:
                assignment.businessId,

            shiftDate:
                today,

            shiftType:
                assignment.shift,

            plannedStartTime:
                assignment.shiftStartTime,

            plannedEndTime:
                assignment.shiftEndTime,

            actualStartTime:
                new Date(),

            actualEndTime:
                null,

            status:
                "in-progress"
        });


        // ========================================================
        // CREATE TODAY'S PAYMENT
        // ONLY WHEN DRIVER ACTUALLY STARTS SHIFT
        // ========================================================

        const existingPayment = await Payment.findOne({

            assignmentId:
                assignment._id,

            paymentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });


        let payment = existingPayment;


        if (!payment) {

            payment = await Payment.create({

                assignmentId:
                    assignment._id,

                driverId:
                    assignment.driverId,

                vehicleId:
                    assignment.vehicleId,

                businessId:
                    assignment.businessId,

                paymentDate:
                    today,

                dueAmount:
                    assignment.dailyRent,

                paidAmount:
                    0,

                status:
                    "pending",

                transactions:
                    []
            });
        }


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(201).json({

            message:
                "Shift started successfully",

            shift,

            payment
        });


    } catch (error) {

        console.error(
            "Start Shift Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// END TODAY'S SHIFT
// ============================================================

const endShift = async (req, res) => {

    try {

        // --------------------------------------------------------
        // FIND CURRENT ACTIVE ASSIGNMENT
        // --------------------------------------------------------
        //
        // THIS IS THE IMPORTANT FIX.
        //
        // We do NOT search for any in-progress shift belonging
        // to this driver.
        //
        // We first find the driver's CURRENT assignment.
        //
        // Then we find the shift belonging to THAT assignment.
        // --------------------------------------------------------

        const assignment = await Assignment.findOne({
            driverId: req.user._id,
            status: "active"
        });

        if (!assignment) {

            return res.status(404).json({
                message:
                    "No active assignment found"
            });
        }


        // --------------------------------------------------------
        // TODAY
        // --------------------------------------------------------

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);


        // --------------------------------------------------------
        // FIND SHIFT FOR CURRENT ASSIGNMENT ONLY
        // --------------------------------------------------------

        const shift = await Shift.findOne({

            assignmentId:
                assignment._id,

            driverId:
                req.user._id,

            shiftDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },

            status:
                "in-progress"

        });


        if (!shift) {

            return res.status(404).json({
                message:
                    "No active shift found for today's assignment"
            });
        }


        // --------------------------------------------------------
        // END SHIFT
        // --------------------------------------------------------

        shift.actualEndTime =
            new Date();

        shift.status =
            "completed";


        await shift.save();


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.status(200).json({

            message:
                "Shift ended successfully",

            shift
        });


    } catch (error) {

        console.error(
            "End Shift Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ============================================================
// DRIVER SHIFT HISTORY
// ============================================================

const getMyShiftHistory = async (req, res) => {

    try {

        const shifts =
            await Shift.find({

                driverId:
                    req.user._id

            })

            .populate(
                "vehicleId",
                "registrationNumber"
            )

            .populate(
                "businessId",
                "businessName"
            )

            .sort({
                shiftDate: -1,
                createdAt: -1
            });


        res.status(200).json({

            count:
                shifts.length,

            shifts

        });


    } catch (error) {

        console.error(
            "Get Shift History Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ============================================================
// BUSINESS SHIFT HISTORY
// ============================================================

const getBusinessShifts = async (req, res) => {

    try {

        const shifts =
            await Shift.find({

                businessId:
                    req.user._id

            })

            .populate(
                "driverId",
                "fullName mobileNumber"
            )

            .populate(
                "vehicleId",
                "registrationNumber"
            )

            .sort({
                shiftDate: -1,
                createdAt: -1
            });


        res.status(200).json({

            count:
                shifts.length,

            shifts

        });


    } catch (error) {

        console.error(
            "Get Business Shifts Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ============================================================
// VEHICLE SHIFT HISTORY
// ============================================================

const getVehicleShiftHistory = async (req, res) => {

    try {

        const shifts =
            await Shift.find({

                businessId:
                    req.user._id,

                vehicleId:
                    req.params.vehicleId

            })

            .populate(
                "driverId",
                "fullName mobileNumber"
            )

            .populate(
                "vehicleId",
                "registrationNumber"
            )

            .sort({
                shiftDate: -1,
                createdAt: -1
            });


        res.status(200).json({

            count:
                shifts.length,

            shifts

        });


    } catch (error) {

        console.error(
            "Vehicle Shift History Error:",
            error
        );

        res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ============================================================
// DRIVER TAKES TODAY OFF
// ============================================================

// ============================================================
// DRIVER TAKES TODAY OFF
// ============================================================

const takeDayOff = async (req, res) => {

    try {

        // --------------------------------------------------------
        // Find driver's active assignment
        // --------------------------------------------------------

        const assignment =
            await Assignment.findOne({

                driverId:
                    req.user._id,

                status:
                    "active"

            })
            .populate(
                "driverId",
                "fullName mobileNumber"
            )
            .populate(
                "vehicleId",
                "registrationNumber"
            );


        if (!assignment) {

            return res.status(404).json({

                message:
                    "No active assignment found"

            });

        }


        // --------------------------------------------------------
        // Today's date
        // --------------------------------------------------------

        const today =
            new Date();


        const startOfDay =
            new Date(today);

        startOfDay.setHours(
            0,
            0,
            0,
            0
        );


        const endOfDay =
            new Date(today);

        endOfDay.setHours(
            23,
            59,
            59,
            999
        );


        // --------------------------------------------------------
        // Find today's shift
        // --------------------------------------------------------

        let shift =
            await Shift.findOne({

                assignmentId:
                    assignment._id,

                shiftDate: {

                    $gte:
                        startOfDay,

                    $lte:
                        endOfDay

                }

            });


        // --------------------------------------------------------
        // Cannot take day off after starting
        // --------------------------------------------------------

        if (
            shift &&
            (
                shift.status ===
                    "in-progress" ||

                shift.status ===
                    "completed"
            )
        ) {

            return res.status(400).json({

                message:
                    "You cannot take a day off after starting today's shift"

            });

        }


        // --------------------------------------------------------
        // Already took day off
        // --------------------------------------------------------

        if (
            shift &&
            shift.status ===
                "day-off"
        ) {

            return res.status(400).json({

                message:
                    "You have already taken today off"

            });

        }


        // --------------------------------------------------------
        // Reason
        // --------------------------------------------------------

        const {
            reason = ""
        } = req.body;


        // ========================================================
        // CREATE / UPDATE TODAY'S SHIFT
        // ========================================================

        if (!shift) {

            shift =
                await Shift.create({

                    assignmentId:
                        assignment._id,

                    driverId:
                        assignment.driverId._id,

                    vehicleId:
                        assignment.vehicleId._id,

                    businessId:
                        assignment.businessId,

                    shiftDate:
                        today,

                    shiftType:
                        assignment.shift,

                    plannedStartTime:
                        assignment.shiftStartTime,

                    plannedEndTime:
                        assignment.shiftEndTime,

                    actualStartTime:
                        null,

                    actualEndTime:
                        null,

                    status:
                        "day-off",

                    dayOffReason:
                        reason,

                    dayOffAt:
                        new Date()

                });

        } else {

            shift.status =
                "day-off";

            shift.dayOffReason =
                reason;

            shift.dayOffAt =
                new Date();

            await shift.save();

        }


        // ========================================================
        // DATE KEY
        // ========================================================

        const dateKey =
            `${today.getFullYear()}-${
                String(
                    today.getMonth() + 1
                ).padStart(2, "0")
            }-${
                String(
                    today.getDate()
                ).padStart(2, "0")
            }`;


        // ========================================================
        // MARK OLD "NOT STARTED" BUSINESS ALERT AS READ
        //
        // This prevents the owner from seeing:
        //
        // ❌ Driver has not started
        //
        // after the driver has already reported:
        //
        // ✅ Day Off
        // ========================================================

        await Notification.updateOne(

            {

                recipientId:
                    assignment.businessId,

                recipientType:
                    "business",

                type:
                    "shift_reminder",

                dedupeKey:
                    `shift-not-started-business-${assignment._id}-${dateKey}`

            },

            {

                $set: {
                    isRead: true
                }

            }

        );


        // ========================================================
        // CREATE BUSINESS DAY-OFF NOTIFICATION
        // ========================================================

        const driverName =
            assignment.driverId?.fullName ||
            "Driver";


        const vehicleNumber =
            assignment.vehicleId
                ?.registrationNumber ||
            "";


        const dayOffNotification =
            await createNotification({

                recipientId:
                    assignment.businessId,

                recipientType:
                    "business",

                type:
                    "day_off",

                title:
                    "Driver Taking Day Off",

                message:
                    `${driverName} has taken today off for the ${assignment.shift} shift${
                        vehicleNumber
                            ? `. Vehicle: ${vehicleNumber}`
                            : ""
                    }${
                        reason
                            ? `. Reason: ${reason}`
                            : "."
                    }`,

                relatedId:
                    assignment._id,

                dedupeKey:
                    `day-off-${assignment._id}-${dateKey}`

            });


        // ========================================================
        // RESPONSE
        // ========================================================

        res.status(200).json({

            message:
                "Today has been marked as a day off",

            shift,

            notificationCreated:
                !!dayOffNotification

        });

    } catch (error) {

        console.error(
            "Take Day Off Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error"

        });

    }

};

// ============================================================
// EXPORT
// ============================================================

module.exports = {

    startShift,
    endShift,
    getMyShiftHistory,
    getBusinessShifts,
    getVehicleShiftHistory,
    takeDayOff

};