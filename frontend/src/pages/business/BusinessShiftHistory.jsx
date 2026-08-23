import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import api from "../../services/api";

import "./BusinessShiftHistory.css";


function BusinessShiftHistory() {

    const navigate =
        useNavigate();

    const [searchParams] =
    useSearchParams();

    const vehicleIdFilter =
        searchParams.get("vehicleId");
    
    const assignmentIdFilter =
        searchParams.get("assignmentId");


    const [shifts, setShifts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [dateFilter, setDateFilter] =
        useState("all");


    // ============================================================
    // LOAD BUSINESS SHIFTS
    // ============================================================

    const loadShifts = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/shifts/business"
                );


            setShifts(
                response.data.shifts ||
                []
            );


        } catch (err) {

            console.error(
                "Business Shift History Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load shift history."
            );


        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadShifts();

    }, []);


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (
        value
    ) => {

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

    const formatTime = (
        value
    ) => {

        if (!value) {
            return "—";
        }


        const text =
            String(
                value
            )
                .trim()
                .toUpperCase();


        const match =
            text.match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
            );


        if (match) {

            return (
                `${String(
                    Number(
                        match[1]
                    )
                ).padStart(
                    2,
                    "0"
                )}:${match[2]} ${match[3]}`
            );

        }


        return text;

    };


    // ============================================================
    // STATUS LABEL
    // ============================================================

    const getStatusLabel = (
        status
    ) => {

        const labels = {

            "in-progress":
                "Running",

            completed:
                "Completed",

            "day-off":
                "Day Off",

            "not-started":
                "Not Started"

        };


        return (
            labels[status] ||
            "Unknown"
        );

    };


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (
        status
    ) => {

        return (
            `business-shift-status ${
                status ||
                "unknown"
            }`
        );

    };


    // ============================================================
    // SEARCH / FILTER
    // ============================================================

    const filteredShifts =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                const today =
                    new Date();


                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return shifts.filter(
                    (shift) => {

                        // ----------------------------------------
                        // SEARCH
                        // ----------------------------------------

                        const shiftVehicleId =
                            String(
                                shift.vehicleId?._id ||
                                shift.vehicleId ||
                                ""
                            );
                        
                        const shiftAssignmentId =
                            String(
                                shift.assignmentId?._id ||
                                shift.assignmentId ||
                                ""
                            );
                        
                        const matchesVehicle =
                            !vehicleIdFilter ||
                            shiftVehicleId ===
                                String(vehicleIdFilter);
                        
                        const matchesAssignment =
                            !assignmentIdFilter ||
                            shiftAssignmentId ===
                                String(assignmentIdFilter);
                        
                        const driverName =
                            shift
                                .driverId
                                ?.fullName ||
                            "";


                        const mobile =
                            shift
                                .driverId
                                ?.mobileNumber ||
                            "";


                        const vehicle =
                            shift
                                .vehicleId
                                ?.registrationNumber ||
                            "";


                        const shiftType =
                            shift.shiftType ||
                            "";


                        const matchesSearch =
                            !query ||

                            driverName
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            mobile
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            vehicle
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            shiftType
                                .toLowerCase()
                                .includes(
                                    query
                                );


                        // ----------------------------------------
                        // STATUS
                        // ----------------------------------------

                        const matchesStatus =
                            statusFilter ===
                                "all" ||

                            shift.status ===
                                statusFilter;


                        // ----------------------------------------
                        // DATE
                        // ----------------------------------------

                        let matchesDate =
                            true;


                        if (
                            dateFilter !==
                            "all"
                        ) {

                            const shiftDate =
                                new Date(
                                    shift.shiftDate
                                );


                            shiftDate.setHours(
                                0,
                                0,
                                0,
                                0
                            );


                            if (
                                dateFilter ===
                                "today"
                            ) {

                                matchesDate =
                                    shiftDate.getTime() ===
                                    today.getTime();

                            }


                            if (
                                dateFilter ===
                                "7days"
                            ) {

                                const sevenDaysAgo =
                                    new Date(
                                        today
                                    );


                                sevenDaysAgo.setDate(
                                    sevenDaysAgo.getDate() -
                                    6
                                );


                                matchesDate =
                                    shiftDate >=
                                    sevenDaysAgo &&
                                    shiftDate <=
                                    today;

                            }

                        }


                        return (
                            matchesVehicle &&
                            matchesAssignment &&
                            matchesSearch &&
                            matchesStatus &&
                            matchesDate
                        );

                    }
                );

            },

            [
                shifts,
                search,
                statusFilter,
                dateFilter,
                vehicleIdFilter,
                assignmentIdFilter
            ]

        );


    // ============================================================
    // COUNT SOURCE
    // ============================================================

    const historyScopeShifts =
        shifts.filter((shift) => {
            const shiftVehicleId =
                String(
                    shift.vehicleId?._id ||
                    shift.vehicleId ||
                    ""
                );

            const shiftAssignmentId =
                String(
                    shift.assignmentId?._id ||
                    shift.assignmentId ||
                    ""
                );

            const matchesVehicle =
                !vehicleIdFilter ||
                shiftVehicleId === String(vehicleIdFilter);

            const matchesAssignment =
                !assignmentIdFilter ||
                shiftAssignmentId === String(assignmentIdFilter);

            return matchesVehicle && matchesAssignment;
        });


    // ============================================================
    // COUNTS
    // ============================================================

    const runningCount =
        historyScopeShifts.filter(
            (shift) =>
                shift.status ===
                "in-progress"
        ).length;


    const completedCount =
        historyScopeShifts.filter(
            (shift) =>
                shift.status ===
                "completed"
        ).length;


    const dayOffCount =
        historyScopeShifts.filter(
            (shift) =>
                shift.status ===
                "day-off"
        ).length;


    const notStartedCount =
        historyScopeShifts.filter(
            (shift) =>
                shift.status ===
                "not-started"
        ).length;


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className=
                    "business-shift-history-page"
            >

                <div
                    className=
                        "business-shift-loading"
                >
                    Loading shift history...
                </div>

            </div>

        );

    }


    // ============================================================
    // MAIN
    // ============================================================

    return (

        <div
            className=
                "business-shift-history-page"
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className=
                    "business-shift-header"
            >

                <div>

                    <button
                        className=
                            "business-shift-back"

                        onClick={() =>
                            navigate(
                                assignmentIdFilter
                                    ? `/business/assignments/${assignmentIdFilter}`
                                    : "/business/dashboard"
                            )
                        }
                    >
                        {assignmentIdFilter
                            ? "← Back to Assignment"
                            : "← Dashboard"
                        }
                    </button>


                    <p
                        className=
                            "business-shift-eyebrow"
                    >
                        FLEETRENT
                    </p>


                    <h1>
                        Shift History
                    </h1>


                    <p
                        className=
                            "business-shift-subtitle"
                    >
                        {assignmentIdFilter
                            ? "View shift history for this assignment."
                            : vehicleIdFilter
                                ? "View shift history for this vehicle."
                                : "View shift activity across your entire fleet."
                        }
                    </p>

                </div>


                <div
                    className=
                        "business-shift-count-box"
                >

                    <strong>
                        {historyScopeShifts.length}
                    </strong>

                    <span>
                        {historyScopeShifts.length === 1
                            ? "Shift"
                            : "Shifts"}
                    </span>

                </div>

            </header>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div
                    className=
                        "business-shift-error"
                >
                    {error}
                </div>

            )}


            {/* ====================================================
                SUMMARY
            ==================================================== */}

            <section
                className=
                    "business-shift-stats"
            >

                <div
                    className=
                        "business-shift-stat"
                >

                    <span>
                        Running
                    </span>

                    <strong
                        className=
                            "running-number"
                    >
                        {runningCount}
                    </strong>

                </div>


                <div
                    className=
                        "business-shift-stat"
                >

                    <span>
                        Completed
                    </span>

                    <strong
                        className=
                            "completed-number"
                    >
                        {completedCount}
                    </strong>

                </div>


                <div
                    className=
                        "business-shift-stat"
                >

                    <span>
                        Day Off
                    </span>

                    <strong
                        className=
                            "dayoff-number"
                    >
                        {dayOffCount}
                    </strong>

                </div>


                <div
                    className=
                        "business-shift-stat"
                >

                    <span>
                        Not Started
                    </span>

                    <strong
                        className=
                            "notstarted-number"
                    >
                        {notStartedCount}
                    </strong>

                </div>

            </section>


            {/* ====================================================
                FILTERS
            ==================================================== */}

            <section
                className=
                    "business-shift-toolbar"
            >

                <div
                    className=
                        "business-shift-search"
                >

                    <span>
                        🔎
                    </span>


                    <input
                        type="text"
                        placeholder=
                            "Search driver, vehicle, mobile or shift..."
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div
                    className=
                        "business-shift-filter-group"
                >

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            All Status
                        </option>

                        <option value="in-progress">
                            Running
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="not-started">
                            Not Started
                        </option>

                        <option value="day-off">
                            Day Off
                        </option>

                    </select>


                    <select
                        value={
                            dateFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setDateFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            All Dates
                        </option>

                        <option value="today">
                            Today
                        </option>

                        <option value="7days">
                            Last 7 Days
                        </option>

                    </select>

                </div>

            </section>


            {/* ====================================================
                HISTORY
            ==================================================== */}

            <section
                className=
                    "business-shift-history-card"
            >

                <div
                    className=
                        "business-shift-history-heading"
                >

                    <div>

                        <p>
                            SHIFT RECORDS
                        </p>

                        <h2>
                            {assignmentIdFilter
                                ? "Assignment Shift Activity"
                                : vehicleIdFilter
                                    ? "Vehicle Shift Activity"
                                    : "Fleet Shift Activity"
                            }
                        </h2>

                        {(vehicleIdFilter || assignmentIdFilter) && (
                            <span className="business-shift-scope-label">
                                {assignmentIdFilter
                                    ? "Showing history for selected assignment"
                                    : "Showing history for selected vehicle"}
                            </span>
                        )}

                    </div>


                    <span>
                        {filteredShifts.length}
                        {" "}
                        result
                        {filteredShifts.length !==
                        1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {filteredShifts.length ===
                    0 ? (

                    <div
                        className=
                            "business-shift-empty"
                    >

                        <div>
                            🕒
                        </div>

                        <h3>
                            No shift records found
                        </h3>

                        <p>
                            Try changing your search or filters.
                        </p>

                    </div>

                ) : (

                    <div
                        className=
                            "business-history-list"
                    >

                        {filteredShifts.map(
                            (shift) => {

                                const assignmentId =
                                    shift.assignmentId?._id ||
                                    shift.assignmentId;


                                return (

                                    <div
                                        className=
                                            "business-history-card"
                                        key={
                                            shift._id
                                        }
                                    >

                                        {/* HEADER */}

                                        <div
                                            className=
                                                "business-history-card-header"
                                        >

                                            <div>

                                                <span
                                                    className=
                                                        "business-history-date"
                                                >
                                                    {
                                                        formatDate(
                                                            shift.shiftDate
                                                        )
                                                    }
                                                </span>


                                                <h3>
                                                    {
                                                        shift.shiftType
                                                            ?.replace(
                                                                "-",
                                                                " "
                                                            )
                                                            ?.replace(
                                                                /^\w/,
                                                                (
                                                                    char
                                                                ) =>
                                                                    char.toUpperCase()
                                                            ) ||
                                                        "Shift"
                                                    }
                                                </h3>

                                            </div>


                                            <span
                                                className={
                                                    getStatusClass(
                                                        shift.status
                                                    )
                                                }
                                            >
                                                {
                                                    getStatusLabel(
                                                        shift.status
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {/* DETAILS */}

                                        <div
                                            className=
                                                "business-history-grid"
                                        >

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


                                            <div>

                                                <span>
                                                    Driver
                                                </span>

                                                <strong>
                                                    {
                                                        shift
                                                            .driverId
                                                            ?.fullName ||
                                                        "No driver"
                                                    }
                                                </strong>

                                                {
                                                    shift
                                                        .driverId
                                                        ?.mobileNumber && (

                                                        <small>
                                                            {
                                                                shift
                                                                    .driverId
                                                                    .mobileNumber
                                                            }
                                                        </small>

                                                    )
                                                }

                                            </div>


                                            <div>

                                                <span>
                                                    Planned Time
                                                </span>

                                                <strong>

                                                    {
                                                        formatTime(
                                                            shift.plannedStartTime
                                                        )
                                                    }

                                                    {" – "}

                                                    {
                                                        formatTime(
                                                            shift.plannedEndTime
                                                        )
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Actual Start
                                                </span>

                                                <strong>
                                                    {
                                                        shift.actualStartTime
                                                            ? formatTime(
                                                                new Date(
                                                                    shift.actualStartTime
                                                                ).toLocaleTimeString(
                                                                    "en-IN",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true
                                                                    }
                                                                )
                                                            )
                                                            : "—"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Actual End
                                                </span>

                                                <strong>
                                                    {
                                                        shift.actualEndTime
                                                            ? formatTime(
                                                                new Date(
                                                                    shift.actualEndTime
                                                                ).toLocaleTimeString(
                                                                    "en-IN",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true
                                                                    }
                                                                )
                                                            )
                                                            : "—"
                                                    }
                                                </strong>

                                            </div>


                                            {shift.status ===
                                                "day-off" && (

                                                <div>

                                                    <span>
                                                        Day-Off Reason
                                                    </span>

                                                    <strong>
                                                        {
                                                            shift.dayOffReason ||
                                                            "Not provided"
                                                        }
                                                    </strong>

                                                </div>

                                            )}

                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            className=
                                                "business-history-actions"
                                        >

                                            {shift
                                                .driverId
                                                ?.mobileNumber && (

                                                <button
                                                    onClick={() =>
                                                        window.location.href =
                                                            `tel:${shift.driverId.mobileNumber}`
                                                    }
                                                >
                                                    📞 Call Driver
                                                </button>

                                            )}


                                            {assignmentId && (

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/business/assignments/${assignmentId}`
                                                        )
                                                    }
                                                >
                                                    View Assignment
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                );

                            }

                        )}

                    </div>

                )}

            </section>

        </div>

    );

}


export default BusinessShiftHistory;