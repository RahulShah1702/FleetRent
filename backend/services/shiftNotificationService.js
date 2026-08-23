const Assignment =
    require("../models/Assignment");

const Shift =
    require("../models/Shift");

const createNotification =
    require("../utils/createNotification");

const PushSubscription =
    require("../models/PushSubscription");

const sendPushNotification =
    require("../utils/pushNotification");


// ============================================================
// BUSINESS OWNER ALERT DELAY
//
// Driver:
//     Reminder every 10 minutes
//
// Business:
//     ONE alert after 60 minutes
// ============================================================

const BUSINESS_ALERT_DELAY = 45;


// ============================================================
// CONVERT SHIFT TIME TO MINUTES
//
// Supports:
//     08:00
//     08:00 AM
//     02:00 PM
// ============================================================

const timeToMinutes = (time) => {

    if (!time) {
        return null;
    }


    const value =
        time
            .trim()
            .toUpperCase();


    // --------------------------------------------------------
    // 12-hour format
    // --------------------------------------------------------

    const amPmMatch =
        value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
        );


    if (amPmMatch) {

        let hours =
            Number(amPmMatch[1]);

        const minutes =
            Number(amPmMatch[2]);

        const period =
            amPmMatch[3];


        if (
            period === "PM" &&
            hours !== 12
        ) {
            hours += 12;
        }


        if (
            period === "AM" &&
            hours === 12
        ) {
            hours = 0;
        }


        return (
            hours * 60 +
            minutes
        );
    }


    // --------------------------------------------------------
    // 24-hour format
    // --------------------------------------------------------

    const simpleMatch =
        value.match(
            /^(\d{1,2}):(\d{2})$/
        );


    if (simpleMatch) {

        return (
            Number(simpleMatch[1]) * 60 +
            Number(simpleMatch[2])
        );
    }


    return null;
};


// ============================================================
// CHECK DRIVER SHIFT REMINDERS
// ============================================================

const checkShiftReminders = async () => {

    try {

        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        const startOfDay =
            new Date(now);

        startOfDay.setHours(
            0,
            0,
            0,
            0
        );


        const endOfDay =
            new Date(now);

        endOfDay.setHours(
            23,
            59,
            59,
            999
        );


        // ====================================================
        // GET ACTIVE ASSIGNMENTS
        // ====================================================

        const assignments =
            await Assignment.find({
                status: "active"
            })
            .populate(
                "driverId",
                "fullName mobileNumber"
            )
            .populate(
                "vehicleId",
                "registrationNumber"
            )
            .populate(
                "businessId",
                "businessName fullName mobileNumber"
            );


        // ====================================================
        // CHECK EACH ASSIGNMENT
        // ====================================================

        for (
            const assignment
            of assignments
        ) {


            // ------------------------------------------------
            // Driver must exist
            // ------------------------------------------------

            if (!assignment.driverId) {
                continue;
            }


            // ------------------------------------------------
            // Business must exist
            // ------------------------------------------------

            if (!assignment.businessId) {
                continue;
            }


            // ------------------------------------------------
            // Convert assignment times
            // ------------------------------------------------

            const plannedStart =
                timeToMinutes(
                    assignment.shiftStartTime
                );


            const plannedEnd =
                timeToMinutes(
                    assignment.shiftEndTime
                );


            if (
                plannedStart === null ||
                plannedEnd === null
            ) {
                continue;
            }


            // ------------------------------------------------
            // Only process after shift starts
            // ------------------------------------------------

            if (
                currentMinutes <
                plannedStart
            ) {
                continue;
            }


            // ------------------------------------------------
            // Stop reminders at shift end
            //
            // Use >= so no reminder is generated at
            // the exact planned end minute.
            // ------------------------------------------------

            if (
                currentMinutes >=
                plannedEnd
            ) {
                continue;
            }


            // =================================================
            // FIND TODAY'S SHIFT
            // =================================================

            const todayShift =
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


            // =================================================
            // DRIVER ALREADY STARTED
            // =================================================

            if (
                todayShift &&
                todayShift.status ===
                    "in-progress"
            ) {
                continue;
            }


            // =================================================
            // DRIVER COMPLETED SHIFT
            // =================================================

            if (
                todayShift &&
                todayShift.status ===
                    "completed"
            ) {
                continue;
            }


            // =================================================
            // DRIVER TOOK DAY OFF
            //
            // IMPORTANT:
            //
            // No driver reminder.
            // No owner "not started" alert.
            //
            // The day-off flow itself will notify
            // the business owner.
            // =================================================

            if (
                todayShift &&
                todayShift.status ===
                    "day-off"
            ) {
                continue;
            }


            // =================================================
            // HOW LONG SINCE SHIFT STARTED?
            // =================================================

            const minutesSinceStart =
                currentMinutes -
                plannedStart;


            // =================================================
            // DATE KEY
            // =================================================

            const dateKey =
                `${now.getFullYear()}-${
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0")
                }-${
                    String(
                        now.getDate()
                    ).padStart(2, "0")
                }`;


            const vehicleNumber =
                assignment.vehicleId
                    ?.registrationNumber ||
                "";


            // =================================================
            // DRIVER REMINDER EVERY 10 MINUTES
            // =================================================

            const reminderNumber =
                Math.floor(
                    minutesSinceStart / 10
                );


            const driverReminderKey =
                `shift-reminder-${assignment._id}-${dateKey}-${reminderNumber}`;


            // =================================================
            // CREATE DRIVER REMINDER
            // =================================================

            const driverNotification =
                await createNotification({

                    recipientId:
                        assignment.driverId._id,

                    recipientType:
                        "driver",

                    type:
                        "shift_reminder",

                    title:
                        "Your shift has started",

                    message:
                        `Your ${assignment.shift} shift is scheduled from ${assignment.shiftStartTime} to ${assignment.shiftEndTime}. Please start your shift${
                            vehicleNumber
                                ? ` for vehicle ${vehicleNumber}`
                                : ""
                        }. Please start your shift if you have reported for work.`,

                    relatedId:
                        assignment._id,

                    dedupeKey:
                        driverReminderKey

                });


            // =================================================
            // SEND DRIVER WEB PUSH
            //
            // ONLY when a NEW notification was created.
            //
            // This prevents:
            //
            // 10:01 → duplicate push ❌
            // 10:02 → duplicate push ❌
            //
            // 10:10 → new reminder ✅
            // =================================================

            if (driverNotification) {

                const subscriptions =
                    await PushSubscription.find({

                        userId:
                            assignment.driverId._id,

                        userType:
                            "driver"

                    });


                for (
                    const subscription
                    of subscriptions
                ) {

                    const pushSubscription = {

                        endpoint:
                            subscription.endpoint,

                        keys: {

                            p256dh:
                                subscription.p256dh,

                            auth:
                                subscription.auth

                        }

                    };


                    const result =
                        await sendPushNotification(

                            pushSubscription,

                            {

                                title:
                                    "FleetRent - Shift Reminder",

                                message:
                                    `Your ${assignment.shift} shift has started. Please start your shift${
                                        vehicleNumber
                                            ? ` for vehicle ${vehicleNumber}`
                                            : ""
                                    }.`,

                                url:
                                    "/driver/shifts"

                            }

                        );


                    // ------------------------------------------------
                    // Remove expired subscription
                    // ------------------------------------------------

                    if (
                        !result.success &&
                        result.statusCode === 410
                    ) {

                        await PushSubscription.deleteOne({

                            _id:
                                subscription._id

                        });

                    }

                }

            }


            // =================================================
            // BUSINESS OWNER ALERT
            //
            // Only after 1 hour.
            // Only ONE notification per assignment/day.
            // =================================================

            if (
                minutesSinceStart >=
                BUSINESS_ALERT_DELAY
            ) {

                const driverName =
                    assignment.driverId.fullName ||
                    "Driver";


                const businessAlertKey =
                    `shift-not-started-business-${assignment._id}-${dateKey}`;


                // ------------------------------------------------
                // Create business notification
                // ------------------------------------------------

                const businessNotification =
                    await createNotification({

                        recipientId:
                            assignment.businessId._id,

                        recipientType:
                            "business",

                        type:
                            "shift_reminder",

                        title:
                            "Attention Required: Driver has not started",

                        message:
                            `${driverName} has not started today's ${assignment.shift} shift. Scheduled from ${assignment.shiftStartTime} to ${assignment.shiftEndTime}${
                                vehicleNumber
                                    ? `. Vehicle: ${vehicleNumber}`
                                    : ""
                            }. No day-off has been reported. You may want to contact the driver.`,

                        relatedId:
                            assignment._id,

                        dedupeKey:
                            businessAlertKey

                    });


                // =================================================
                // SEND BUSINESS WEB PUSH
                //
                // ONLY if a NEW notification was created.
                // =================================================

                if (businessNotification) {

                    const businessSubscriptions =
                        await PushSubscription.find({

                            userId:
                                assignment.businessId._id,

                            userType:
                                "business"

                        });


                    for (
                        const subscription
                        of businessSubscriptions
                    ) {

                        const pushSubscription = {

                            endpoint:
                                subscription.endpoint,

                            keys: {

                                p256dh:
                                    subscription.p256dh,

                                auth:
                                    subscription.auth

                            }

                        };


                        const result =
                            await sendPushNotification(

                                pushSubscription,

                                {

                                    title:
                                        "FleetRent - Attention Required",

                                    message:
                                        `${driverName} has not started today's ${assignment.shift} shift${
                                            vehicleNumber
                                                ? ` for vehicle ${vehicleNumber}`
                                                : ""
                                        }. Please contact the driver.`,

                                    // Business dashboard will use
                                    // this route once we build it.
                                    url:
                                        "/business/dashboard"

                                }

                            );


                        // ------------------------------------------------
                        // Remove expired business subscription
                        // ------------------------------------------------

                        if (
                            !result.success &&
                            result.statusCode === 410
                        ) {

                            await PushSubscription.deleteOne({

                                _id:
                                    subscription._id

                            });

                        }

                    }

                }

            }

        }

    } catch (error) {

        console.error(
            "Shift Reminder Service Error:",
            error
        );

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    checkShiftReminders
};