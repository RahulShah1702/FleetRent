import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./DriverShift.css";


function DriverShift() {

    const navigate = useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    const [assignment, setAssignment] =
        useState(null);

    const [todayShift, setTodayShift] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showDayOffModal, setShowDayOffModal] =
        useState(false);

    const [dayOffReason, setDayOffReason] =
        useState("");


    // ============================================================
    // LOAD ASSIGNMENT + TODAY'S SHIFT
    // ============================================================

    const loadShiftData = async () => {

        try {

            setLoading(true);
            setError("");

            // ----------------------------------------------------
            // GET CURRENT ACTIVE ASSIGNMENT
            // ----------------------------------------------------

            const assignmentResponse =
                await api.get(
                    "/assignments/my"
                );

            const currentAssignment =
                assignmentResponse.data.assignment;

            setAssignment(
                currentAssignment
            );


            // ----------------------------------------------------
            // IF NO ACTIVE ASSIGNMENT
            // ----------------------------------------------------

            if (!currentAssignment) {

                setTodayShift(null);

                return;
            }


            // ----------------------------------------------------
            // GET SHIFT HISTORY
            // ----------------------------------------------------

            const shiftResponse =
                await api.get(
                    "/shifts/my-history"
                );

            const shifts =
                shiftResponse.data.shifts || [];


            // ----------------------------------------------------
            // FIND TODAY'S SHIFT FOR CURRENT ASSIGNMENT ONLY
            // ----------------------------------------------------

            const today =
                new Date();


            const currentAssignmentId =
                String(
                    currentAssignment._id
                );


            const currentTodayShift =
                shifts.find((shift) => {

                    // No date
                    if (!shift.shiftDate) {
                        return false;
                    }


                    // ------------------------------------------------
                    // IMPORTANT:
                    // Ignore shifts belonging to previous assignments
                    // ------------------------------------------------

                    const shiftAssignmentId =
                        shift.assignmentId?._id ||
                        shift.assignmentId;


                    if (!shiftAssignmentId) {
                        return false;
                    }


                    if (
                        String(
                            shiftAssignmentId
                        ) !== currentAssignmentId
                    ) {
                        return false;
                    }


                    // ------------------------------------------------
                    // Check today's date
                    // ------------------------------------------------

                    const shiftDate =
                        new Date(
                            shift.shiftDate
                        );


                    return (
                        shiftDate.getFullYear() ===
                            today.getFullYear() &&

                        shiftDate.getMonth() ===
                            today.getMonth() &&

                        shiftDate.getDate() ===
                            today.getDate()
                    );

                });


            setTodayShift(
                currentTodayShift || null
            );


        } catch (error) {

            console.error(
                "Driver Shift Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load shift."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadShiftData();

    }, []);


    // ============================================================
    // START SHIFT
    // ============================================================

    const handleStartShift = async () => {

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const response =
                await api.post(
                    "/shifts/start"
                );


            setTodayShift(
                response.data.shift
            );

            // The backend creates/ensures today's rent only after
            // a real shift is started. Refresh keeps the UI in sync.
            setSuccess(
                "Shift started successfully. Today's rent is now due."
            );


        } catch (error) {

            console.error(
                "Start Shift Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to start shift."
            );


        } finally {

            setActionLoading(false);

        }

    };


    // ============================================================
    // END SHIFT
    // ============================================================

    const handleEndShift = async () => {

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");


            const response =
                await api.put(
                    "/shifts/end"
                );


            setTodayShift(
                response.data.shift
            );


            setSuccess(
                "Shift ended successfully."
            );


        } catch (error) {

            console.error(
                "End Shift Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to end shift."
            );


        } finally {

            setActionLoading(false);

        }

    };


    // ============================================================
    // TAKE TODAY OFF
    // ============================================================

    const handleDayOff = async () => {
        if (!dayOffReason) {
            setError("Please select a reason for taking today off.");
            return;
        }

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");


            const response =
                await api.post(
                    "/shifts/day-off",
                    {
                        reason: dayOffReason
                    }
                );


            setTodayShift(
                response.data.shift
            );


            setShowDayOffModal(false);


            setSuccess(
                "Today has been marked as a day off. No rent will be charged."
            );


            // Clear selected reason
            setDayOffReason("");


        } catch (error) {

            console.error(
                "Day Off Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to take today off."
            );


        } finally {

            setActionLoading(false);

        }

    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (value) => {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (value) => {

        if (!value) {
            return "—";
        }


        // --------------------------------------------------------
        // Handle "08:00 AM" / "02:00 PM"
        // --------------------------------------------------------

        if (typeof value === "string") {

            const match =
                value
                    .trim()
                    .match(
                        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
                    );


            if (match) {

                let hours =
                    Number(match[1]);

                const minutes =
                    Number(match[2]);

                const period =
                    match[3].toUpperCase();


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


                const date =
                    new Date();


                date.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );


                return date.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

            }


            // ----------------------------------------------------
            // Handle "08:00" / "14:00"
            // ----------------------------------------------------

            const simpleMatch =
                value
                    .trim()
                    .match(
                        /^(\d{1,2}):(\d{2})$/
                    );


            if (simpleMatch) {

                const hours =
                    Number(
                        simpleMatch[1]
                    );

                const minutes =
                    Number(
                        simpleMatch[2]
                    );


                const date =
                    new Date();


                date.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );


                return date.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

            }

        }


        // --------------------------------------------------------
        // Handle actualStartTime / actualEndTime
        // --------------------------------------------------------

        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ============================================================
    // SHIFT NAME
    // ============================================================

    const getShiftName = () => {

        const shiftType =
            todayShift?.shiftType ||
            assignment?.shift;


        if (!shiftType) {
            return "Shift";
        }


        if (
            shiftType === "full-time"
        ) {
            return "Full Time";
        }


        return (
            shiftType.charAt(0).toUpperCase() +
            shiftType.slice(1)
        );

    };


    // ============================================================
    // SHIFT STATUS
    // ============================================================

    const isInProgress =
        todayShift?.status ===
        "in-progress";


    const isCompleted =
        todayShift?.status ===
        "completed";


    const isDayOff =
        todayShift?.status ===
        "day-off";


    const isNotStarted =
        !todayShift;


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="driver-shift-page">

                <button
                    className="shift-back-button"
                    onClick={() =>
                        navigate(
                            "/driver/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>


                <div className="shift-loading">
                    Loading shift...
                </div>

            </div>

        );

    }


    // ============================================================
    // NO ASSIGNMENT
    // ============================================================

    if (!assignment) {

        return (

            <div className="driver-shift-page">

                <button
                    className="shift-back-button"
                    onClick={() =>
                        navigate(
                            "/driver/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>


                <div className="shift-empty-card">

                    <div className="shift-icon">
                        🕒
                    </div>


                    <h2>
                        No Vehicle Assignment
                    </h2>


                    <p>
                        You don't currently have
                        a vehicle or shift assigned.
                    </p>

                </div>

            </div>

        );

    }


    // ============================================================
    // CURRENT ASSIGNMENT DETAILS
    // ============================================================

    const vehicle =
        assignment?.vehicleId;


    const shiftType =
        assignment?.shift;


    const plannedStart =
        assignment?.shiftStartTime;


    const plannedEnd =
        assignment?.shiftEndTime;


    // ============================================================
    // CALL BUSINESS OWNER
    // ============================================================

    const handleCallOwner = () => {
        const ownerNumber = assignment?.businessId?.mobileNumber;

        if (!ownerNumber) {
            setError("Business owner phone number is not available.");
            return;
        }

        window.location.href = `tel:${ownerNumber}`;
    };


    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <div className="driver-shift-page">


            {/* ====================================================
                DAY OFF MODAL
            ==================================================== */}

            {showDayOffModal && (

                <div className="day-off-overlay">

                    <div className="day-off-modal">

                        <h2>
                            Take Today Off?
                        </h2>


                        <p>
                            You won't be charged
                            today's daily rent.
                        </p>


                        <label>

                            Reason

                            <select
                                value={
                                    dayOffReason
                                }
                                onChange={(e) =>
                                    setDayOffReason(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select a reason
                                </option>


                                <option value="Personal">
                                    Personal
                                </option>


                                <option value="Emergency">
                                    Emergency
                                </option>


                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </label>


                        <div className="day-off-actions">

                            <button
                                onClick={() => {

                                    setShowDayOffModal(
                                        false
                                    );

                                    setDayOffReason(
                                        ""
                                    );

                                }}
                                disabled={
                                    actionLoading
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="confirm-day-off"
                                onClick={
                                    handleDayOff
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                {actionLoading
                                    ? "Confirming..."
                                    : "Confirm Day Off"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                BACK
            ==================================================== */}

            <button
                className="shift-back-button"
                onClick={() =>
                    navigate(
                        "/driver/dashboard"
                    )
                }
            >
                ← Back to Dashboard
            </button>


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="shift-header">

                <p className="shift-eyebrow">
                    FLEETRENT
                </p>


                <h1>
                    Shift
                </h1>


                <p>
                    Manage your current
                    working shift.
                </p>

            </div>


            {/* ====================================================
                SUCCESS
            ==================================================== */}

            {success && (

                <div className="shift-success">
                    {success}
                </div>

            )}


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="shift-error">
                    {error}
                </div>

            )}


            {/* ====================================================
                SHIFT CARD
            ==================================================== */}

            <section className="shift-card">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="shift-card-header">

                    <div>

                        <p className="shift-label">
                            Today's Shift
                        </p>


                        <h2>
                            {getShiftName()}
                        </h2>

                    </div>


                    {/* STATUS */}

                    {isNotStarted && (

                        <span className="shift-status not-started">
                            Not Started
                        </span>

                    )}


                    {isInProgress && (

                        <span className="shift-status in-progress">
                            In Progress
                        </span>

                    )}


                    {isCompleted && (

                        <span className="shift-status completed">
                            Completed
                        </span>

                    )}


                    {isDayOff && (

                        <span className="shift-status day-off">
                            Day Off
                        </span>

                    )}

                </div>


                <div className="shift-divider" />


                {/* ==================================================
                    DETAILS
                ================================================== */}

                <div className="shift-details">


                    {/* DATE */}

                    <div>

                        <span>
                            Date
                        </span>


                        <strong>
                            {formatDate(
                                todayShift?.shiftDate ||
                                new Date()
                            )}
                        </strong>

                    </div>


                    {/* VEHICLE */}

                    <div>

                        <span>
                            Vehicle
                        </span>


                        <strong>
                            {
                                vehicle?.registrationNumber ||
                                "—"
                            }
                        </strong>

                    </div>


                    {/* PLANNED START */}

                    <div>

                        <span>
                            Planned Start
                        </span>


                        <strong>
                            {formatTime(
                                plannedStart
                            )}
                        </strong>

                    </div>


                    {/* PLANNED END */}

                    <div>

                        <span>
                            Planned End
                        </span>


                        <strong>
                            {formatTime(
                                plannedEnd
                            )}
                        </strong>

                    </div>


                    {/* ACTUAL START */}

                    <div>

                        <span>
                            Actual Start
                        </span>


                        <strong>
                            {formatTime(
                                todayShift?.actualStartTime
                            )}
                        </strong>

                    </div>


                    {/* ACTUAL END */}

                    <div>

                        <span>
                            Actual End
                        </span>


                        <strong>
                            {formatTime(
                                todayShift?.actualEndTime
                            )}
                        </strong>

                    </div>

                </div>


                {/* ==================================================
                    DAY OFF INFORMATION
                ================================================== */}

                {isDayOff && (

                    <div className="day-off-info">

                        <strong>
                            Today is marked as a day off.
                        </strong>


                        <span>
                            No daily rent will be charged.
                        </span>


                        {todayShift?.dayOffReason && (

                            <span>
                                Reason:{" "}
                                {todayShift.dayOffReason}
                            </span>

                        )}

                    </div>

                )}


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="shift-actions">


                    {/* ----------------------------------------------
                        NOT STARTED
                    ---------------------------------------------- */}

                    {isNotStarted && (

                        <>

                            <button
                                className="start-shift-button"
                                onClick={
                                    handleStartShift
                                }
                                disabled={
                                    actionLoading
                                }
                            >

                                {actionLoading
                                    ? "Starting..."
                                    : `Start ${getShiftName()} Shift`
                                }

                            </button>


                            <button
                                className="day-off-button"
                                onClick={() =>
                                    setShowDayOffModal(
                                        true
                                    )
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                Take Today Off
                            </button>

                        </>

                    )}


                    {/* ----------------------------------------------
                        IN PROGRESS
                    ---------------------------------------------- */}

                    {isInProgress && (

                        <button
                            className="end-shift-button"
                            onClick={
                                handleEndShift
                            }
                            disabled={
                                actionLoading
                            }
                        >

                            {actionLoading
                                ? "Ending..."
                                : `End ${getShiftName()} Shift`
                            }

                        </button>

                    )}


                    {/* ----------------------------------------------
                        COMPLETED
                    ---------------------------------------------- */}

                    {isCompleted && (

                        <span className="shift-completed-message">
                            Today's shift has been completed.
                        </span>

                    )}


                    {/* ----------------------------------------------
                        DAY OFF
                    ---------------------------------------------- */}

                    {isDayOff && (

                        <span className="shift-completed-message">
                            No rent will be charged for today.
                        </span>

                    )}

                </div>

            </section>

        </div>

    );

}


export default DriverShift;