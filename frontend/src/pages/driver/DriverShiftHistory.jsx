import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./DriverShiftHistory.css";


function DriverShiftHistory() {

    const navigate = useNavigate();


    const [shifts, setShifts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ============================================================
    // LOAD SHIFT HISTORY
    // ============================================================

    useEffect(() => {

        const loadHistory =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/shifts/my-history"
                        );


                    setShifts(
                        response.data.shifts || []
                    );


                } catch (error) {

                    console.error(
                        "Shift History Error:",
                        error
                    );


                    setError(
                        error.response?.data?.message ||
                        "Unable to load shift history."
                    );


                } finally {

                    setLoading(false);

                }
            };


        loadHistory();

    }, []);


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
        // If already a Date / ISO date string
        // --------------------------------------------------------

        if (
            value instanceof Date ||
            (
                typeof value === "string" &&
                value.includes("T")
            )
        ) {

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
        }


        // --------------------------------------------------------
        // TIME STRING
        //
        // Supports:
        //
        // 06:00
        // 6:00
        // 06:00 AM
        // 6:00 AM
        // 06:00 PM
        // 6:00 PM
        // 18:00
        // --------------------------------------------------------

        if (
            typeof value === "string"
        ) {

            const time =
                value
                    .trim()
                    .toUpperCase();


            // ----------------------------------------------------
            // 12-hour format
            // Example: 06:00 PM
            // ----------------------------------------------------

            const twelveHourMatch =
                time.match(
                    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
                );


            if (twelveHourMatch) {

                let hours =
                    Number(
                        twelveHourMatch[1]
                    );

                const minutes =
                    Number(
                        twelveHourMatch[2]
                    );

                const period =
                    twelveHourMatch[3];


                if (
                    hours < 1 ||
                    hours > 12 ||
                    minutes < 0 ||
                    minutes > 59
                ) {
                    return "—";
                }


                if (period === "AM") {

                    if (hours === 12) {
                        hours = 0;
                    }

                } else {

                    if (hours !== 12) {
                        hours += 12;
                    }
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
            // 24-hour format
            // Example: 18:00
            // ----------------------------------------------------

            const twentyFourHourMatch =
                time.match(
                    /^(\d{1,2}):(\d{2})$/
                );


            if (twentyFourHourMatch) {

                const hours =
                    Number(
                        twentyFourHourMatch[1]
                    );

                const minutes =
                    Number(
                        twentyFourHourMatch[2]
                    );


                if (
                    hours < 0 ||
                    hours > 23 ||
                    minutes < 0 ||
                    minutes > 59
                ) {
                    return "—";
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
        }


        // --------------------------------------------------------
        // Last attempt for actual Date values
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
    // FORMAT TEXT
    // ============================================================

    const formatText = (value) => {

        if (!value) {
            return "—";
        }


        return value
            .toString()
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="shift-history-page">

                <div className="shift-history-container">

                    <button
                        type="button"
                        className="history-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="history-loading">
                        Loading shift history...
                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <div className="shift-history-page">

                <div className="shift-history-container">

                    <button
                        type="button"
                        className="history-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="history-error">
                        {error}
                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <div className="shift-history-page">

            <div className="shift-history-container">


                {/* ==================================================
                    BACK
                ================================================== */}

                <button
                    type="button"
                    className="history-back-button"
                    onClick={() =>
                        navigate(
                            "/driver/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="history-header">

                    <div>

                        <p className="history-eyebrow">
                            FleetRent
                        </p>


                        <h1>
                            Shift History
                        </h1>


                        <p>
                            View your previous and current shifts.
                        </p>

                    </div>


                    <div className="shift-count">

                        {shifts.length}

                        <span>
                            {shifts.length === 1
                                ? " Shift"
                                : " Shifts"
                            }
                        </span>

                    </div>

                </div>


                {/* ==================================================
                    EMPTY
                ================================================== */}

                {shifts.length === 0 ? (

                    <div className="history-empty">

                        <div className="history-empty-icon">
                            🕒
                        </div>


                        <h2>
                            No Shift History
                        </h2>


                        <p>
                            Your shifts will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="history-list">

                        {shifts.map(
                            (shift, index) => (

                                <div
                                    className="history-card"
                                    key={
                                        shift._id ||
                                        index
                                    }
                                >


                                    {/* ==================================================
                                        CARD HEADER
                                    ================================================== */}

                                    <div className="history-card-header">

                                        <div>

                                            <span className="history-date">

                                                {formatDate(
                                                    shift.shiftDate
                                                )}

                                            </span>


                                            <h2>

                                                {formatText(
                                                    shift.shiftType ||
                                                    shift.shift
                                                )}

                                            </h2>

                                        </div>


                                        <span
                                            className={`history-status ${
                                                shift.status ===
                                                "in-progress"

                                                    ? "status-progress"

                                                    : shift.status ===
                                                      "completed"

                                                    ? "status-completed"

                                                    : shift.status ===
                                                      "day-off"

                                                    ? "status-default"

                                                    : "status-default"
                                            }`}
                                        >

                                            {formatText(
                                                shift.status
                                            )}

                                        </span>

                                    </div>


                                    {/* ==================================================
                                        DETAILS
                                    ================================================== */}

                                    <div className="history-details">


                                        {/* VEHICLE */}

                                        <div>

                                            <span>
                                                Vehicle
                                            </span>

                                            <strong>

                                                {
                                                    shift
                                                        .vehicleId
                                                        ?.registrationNumber ||
                                                    "—"
                                                }

                                            </strong>

                                        </div>


                                        {/* PLANNED TIME */}

                                        <div>

                                            <span>
                                                Planned Time
                                            </span>

                                            <strong>

                                                {formatTime(
                                                    shift.plannedStartTime
                                                )}

                                                {" – "}

                                                {formatTime(
                                                    shift.plannedEndTime
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
                                                    shift.actualStartTime
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
                                                    shift.actualEndTime
                                                )}

                                            </strong>

                                        </div>


                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}


export default DriverShiftHistory;