import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api
    from "../../services/api";

import "./BusinessDashboard.css";

import AppFooter
    from "../../components/common/AppFooter";

import ThemeToggle
    from "../../components/common/ThemeToggle";


function BusinessDashboard() {

    const navigate =
        useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    const [business, setBusiness] =
        useState(null);

    const [vehicles, setVehicles] =
        useState([]);

    const [assignments, setAssignments] =
        useState([]);

    const [shifts, setShifts] =
        useState([]);

    const [paymentSummary, setPaymentSummary] =
        useState({

            totalPending: 0,

            totalPaid: 0,

            totalDue: 0

        });


    const [notifications, setNotifications] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [activitySearch, setActivitySearch] =
        useState("");

    const [activityPage, setActivityPage] =
        useState(1);

    const ACTIVITY_PAGE_SIZE = 15;


    // ============================================================
    // DATE HELPERS
    // ============================================================

    const todayKey = (
        value
    ) => {

        const date =
            value
                ? new Date(value)
                : new Date();


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return (

            `${date.getFullYear()}-` +

            `${String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )}-` +

            `${String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )}`

        );

    };


    // ============================================================
    // LOAD DASHBOARD
    // ============================================================

    const loadDashboard =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const [

                        profileRes,

                        vehiclesRes,

                        assignmentsRes,

                        shiftsRes,

                        paymentsRes,

                        notificationsRes

                    ] = await Promise.all([

                        api.get(
                            "/business/profile"
                        ),

                        api.get(
                            "/vehicles"
                        ),

                        api.get(
                            "/assignments"
                        ),

                        api.get(
                            "/shifts/business"
                        ),

                        api.get(
                            "/payments/business"
                        ),

                        api.get(
                            "/notifications"
                        )

                    ]);


                    setBusiness(
                        profileRes
                            .data
                            .business ||
                        null
                    );


                    setVehicles(
                        vehiclesRes
                            .data
                            .vehicles ||
                        []
                    );


                    setAssignments(
                        assignmentsRes
                            .data
                            .assignments ||
                        []
                    );


                    setShifts(
                        shiftsRes
                            .data
                            .shifts ||
                        []
                    );


                    setPaymentSummary(

                        paymentsRes
                            .data
                            .summary ||

                        {
                            totalPending: 0,
                            totalPaid: 0,
                            totalDue: 0
                        }

                    );


                    setNotifications(
                        notificationsRes
                            .data
                            .notifications ||
                        []
                    );


                } catch (err) {

                    console.error(
                        "Business Dashboard Error:",
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||

                        "Unable to load business dashboard."
                    );


                } finally {

                    setLoading(false);

                }

            },

            []

        );


    useEffect(() => {

        loadDashboard();

    }, [
        loadDashboard
    ]);


    // ============================================================
    // TODAY
    // ============================================================

    const today =
        todayKey();


    const todayShifts =
        shifts.filter(
            (shift) =>
                todayKey(
                    shift.shiftDate
                ) === today
        );


    // ============================================================
    // VEHICLE COUNTS
    // ============================================================

    const activeVehicles =
        vehicles.filter(
            (vehicle) =>
                vehicle.status ===
                "active"
        );


    const inactiveVehicles =
        vehicles.filter(
            (vehicle) =>
                vehicle.status ===
                "inactive"
        );


    // ============================================================
    // ACTIVE ASSIGNMENTS
    // ============================================================

    const activeAssignments =
        assignments.filter(
            (assignment) =>
                assignment.status ===
                "active"
        );


    const assignedVehicleIds =
        new Set(

            activeAssignments
                .map(
                    (assignment) =>

                        String(

                            assignment
                                .vehicleId
                                ?._id ||

                            assignment
                                .vehicleId

                        )

                )

                .filter(Boolean)

        );


    const assignedActiveVehicleCount =
        activeVehicles.filter(
            (vehicle) =>
                assignedVehicleIds.has(
                    String(
                        vehicle._id
                    )
                )
        ).length;


    const availableActiveVehicleCount =
        activeVehicles.length -
        assignedActiveVehicleCount;

// ============================================================
// TODAY STATUS COUNTS
// ============================================================
        
    const hasActiveAssignment = (shift) => {
        const assignmentId =
            shift.assignmentId?._id ||
            shift.assignmentId;
    
        return activeAssignments.some(
            (assignment) =>
                String(assignment._id) ===
                String(assignmentId)
        );
    };
    
    
    const runningVehicles =
        todayShifts
            .filter(
                (shift) =>
                    shift.status === "in-progress" &&
                    hasActiveAssignment(shift)
            )
            .map(
                (shift) =>
                    String(
                        shift.vehicleId?._id ||
                        shift.vehicleId
                    )
            )
            .filter(
                (id, index, arr) =>
                    id &&
                    arr.indexOf(id) === index
            );
        
        
    const completedVehicles =
        todayShifts
            .filter(
                (shift) =>
                    shift.status === "completed" &&
                    hasActiveAssignment(shift)
            )
            .map(
                (shift) =>
                    String(
                        shift.vehicleId?._id ||
                        shift.vehicleId
                    )
            )
            .filter(
                (id, index, arr) =>
                    id &&
                    arr.indexOf(id) === index
            );
        
        
    const dayOffCount =
        todayShifts.filter(
            (shift) =>
                shift.status === "day-off" &&
                hasActiveAssignment(shift)
        ).length;
    
    
    const startedCount =
        todayShifts.filter(
            (shift) =>
                hasActiveAssignment(shift) &&
                (
                    shift.status === "in-progress" ||
                    shift.status === "completed"
                )
        ).length;
    
    
    const notStartedCount =
        todayShifts.filter(
            (shift) =>
                shift.status === "not-started" &&
                hasActiveAssignment(shift)
        ).length;

    // ============================================================
    // UNREAD NOTIFICATIONS
    // ============================================================

    const unreadNotifications =
        notifications.filter(
            (notification) =>
                !notification.isRead
        );


    // ============================================================
    // VEHICLE ACTIVITY
    //
    // One active vehicle may have:
    // morning + evening shifts.
    //
    // Therefore shift records are shown individually.
    // Only vehicles with a valid active assignment and a shift today are shown.
    // ============================================================

    const vehicleActivityRows =
        useMemo(
            () => {

                // Only vehicles that actually have
                // an active assignment are relevant
                // to today's operational view.

                return todayShifts
                    .map((shift) => {

                        const vehicleId =
                            String(
                                shift.vehicleId?._id ||
                                shift.vehicleId ||
                                ""
                            );


                        const assignment =
                            activeAssignments.find(
                                (item) =>
                                    String(
                                        item._id
                                    ) ===
                                    String(
                                        shift.assignmentId?._id ||
                                        shift.assignmentId
                                    )
                            );


                        // If the shift has no valid
                        // active assignment, don't
                        // show it in dashboard activity.

                        if (!assignment) {
                            return null;
                        }


                        return {
                            type: "shift",
                            vehicleId,
                            shift,
                            assignment
                        };

                    })
                    .filter(Boolean);

            },
            [
                todayShifts,
                activeAssignments
            ]
        );


    const filteredActivityRows =
        useMemo(
            () => {
            
                const query =
                    activitySearch
                        .trim()
                        .toLowerCase();
            
            
                if (!query) {
                    return vehicleActivityRows;
                }
            
            
                return vehicleActivityRows.filter(
                    (row) => {
                    
                        const vehicle =
                            row.shift
                                ?.vehicleId
                                ?.registrationNumber ||
                            row.assignment
                                ?.vehicleId
                                ?.registrationNumber ||
                            "";
                    
                    
                        const driver =
                            row.shift
                                ?.driverId
                                ?.fullName ||
                            row.assignment
                                ?.driverId
                                ?.fullName ||
                            "";
                    
                    
                        const mobile =
                            row.shift
                                ?.driverId
                                ?.mobileNumber ||
                            row.assignment
                                ?.driverId
                                ?.mobileNumber ||
                            "";
                    
                    
                        return (
                        
                            vehicle
                                .toLowerCase()
                                .includes(query) ||
                        
                            driver
                                .toLowerCase()
                                .includes(query) ||
                        
                            mobile
                                .toLowerCase()
                                .includes(query)
                        
                        );
                    
                    }
                );
            
            },
            [
                vehicleActivityRows,
                activitySearch
            ]
        );


    const totalActivityPages =
        Math.max(
            1,
            Math.ceil(
                filteredActivityRows.length /
                ACTIVITY_PAGE_SIZE
            )
        );


    const paginatedActivityRows =
        filteredActivityRows.slice(
            (
                activityPage - 1
            ) *
            ACTIVITY_PAGE_SIZE,

            activityPage *
            ACTIVITY_PAGE_SIZE
        );


    useEffect(() => {

        setActivityPage(1);

    }, [
        activitySearch
    ]);


    useEffect(() => {

        if (activityPage > totalActivityPages) {

            setActivityPage(
                totalActivityPages
            );

        }

    }, [
        activityPage,
        totalActivityPages
    ]);

    // ============================================================
    // FORMATTING
    // ============================================================

    const formatMoney =
        (value) =>

            `₹${Number(
                value || 0
            ).toLocaleString(
                "en-IN"
            )}`;


    const formatTime =
        (value) => {

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


            if (!match) {
                return text;
            }


            return (

                `${String(
                    Number(
                        match[1]
                    )
                ).padStart(
                    2,
                    "0"
                )}` +

                `:${match[2]} ` +

                `${match[3]}`

            );

        };


    const formatDate =
        (value) => {

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
    // STATUS
    // ============================================================

    const getStatusLabel =
        (status) => {

            const labels = {

                "in-progress":
                    "Running",

                completed:
                    "Completed",

                "day-off":
                    "Day Off",

                "not-started":
                    "Not Started",

                "no-shift":
                    "No Shift Today",

                "unassigned":
                    "No Driver"

            };


            return (
                labels[
                    status
                ] ||
                "No Shift Today"
            );

        };


    const getStatusClass =
        (status) =>

            `business-status business-status-${
                status ||
                "no-shift"
            }`;


    // ============================================================
    // DRIVER / VEHICLE
    // ============================================================

    const getDriverName =
        (shift, assignment) => {

            return (

                shift
                    ?.driverId
                    ?.fullName ||

                assignment
                    ?.driverId
                    ?.fullName ||

                "No driver"

            );

        };


    const getDriverMobile =
        (shift, assignment) => {

            return (

                shift
                    ?.driverId
                    ?.mobileNumber ||

                assignment
                    ?.driverId
                    ?.mobileNumber ||

                ""

            );

        };


    const getVehicleNumber =
        (shift, assignment, vehicleId) => {

            return (

                shift
                    ?.vehicleId
                    ?.registrationNumber ||

                assignment
                    ?.vehicleId
                    ?.registrationNumber ||

                vehicles.find(

                    (vehicle) =>
                        String(
                            vehicle._id
                        ) ===
                        String(
                            vehicleId
                        )

                )?.registrationNumber ||

                "—"

            );

        };


    // ============================================================
    // CALL DRIVER
    // ============================================================

    const callDriver =
        (shift, assignment) => {

            const number =
                getDriverMobile(
                    shift,
                    assignment
                );


            if (number) {

                window.location.href =
                    `tel:${number}`;

            }

        };


    // ============================================================
    // FIND ASSIGNMENT
    // ============================================================

    const getAssignmentId =
        (assignment, shift) => {

            return (

                assignment?._id ||

                shift
                    ?.assignmentId
                    ?._id ||

                shift
                    ?.assignmentId ||

                null

            );

        };


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    const markNotificationRead =
        async (
            notification
        ) => {

            try {

                if (
                    !notification.isRead
                ) {

                    await api.put(
                        `/notifications/${notification._id}/read`
                    );

                }


                setNotifications(
                    (current) =>

                        current.map(
                            (item) =>

                                item._id ===
                                notification._id

                                    ? {
                                        ...item,
                                        isRead: true
                                    }

                                    : item
                        )
                );


            } catch (err) {

                console.error(
                    "Notification Read Error:",
                    err
                );

            }

        };


    const handleNotificationClick = async (notification) => {
        await markNotificationRead(notification);
        
        // ------------------------------------------------------------
        // Find the assignment associated with this notification
        // ------------------------------------------------------------
        
        const relatedAssignment = notification.relatedId
            ? assignments.find(
                  (assignment) =>
                      String(assignment._id) ===
                      String(notification.relatedId)
              )
            : null;
          
        // ------------------------------------------------------------
        // Shift / day-off notification
        // ------------------------------------------------------------
          
        if (
            notification.type === "day_off" ||
            notification.type === "shift_reminder"
        ) {
            // We know the assignment, so we can identify the
            // exact vehicle and assignment.
            if (relatedAssignment) {
                const vehicleId =
                    relatedAssignment.vehicleId?._id ||
                    relatedAssignment.vehicleId;
            
                const assignmentId =
                    relatedAssignment._id;
            
                if (vehicleId && assignmentId) {
                    navigate(
                        `/business/shifts?vehicleId=${encodeURIComponent(
                            vehicleId
                        )}&assignmentId=${encodeURIComponent(
                            assignmentId
                        )}`
                    );
                
                    return;
                }
            }
        
            // Fallback if assignment is unavailable
            navigate("/business/shifts");
            return;
        }
    
        // ------------------------------------------------------------
        // Other notifications
        // ------------------------------------------------------------
    
        if (notification.relatedId) {
            navigate("/business/shifts");
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className=
                    "business-dashboard-page"
            >

                <div
                    className=
                        "business-dashboard-loading"
                >
                    Loading dashboard...
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
                "business-dashboard-page"
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className=
                    "business-dashboard-header"
            >

                <div>

                    <p
                        className=
                            "business-eyebrow"
                    >
                        FLEETRENT
                    </p>


                    <h1>
                        Business Dashboard
                    </h1>


                    <p
                        className=
                            "business-header-subtitle"
                    >
                        {
                            business?.businessName ||
                            "Manage your fleet and daily operations."
                        }
                    </p>

                </div>


                <div
                    className=
                        "business-header-actions"
                >

                    <button
                        className=
                            "business-icon-button"

                        onClick={() =>
                            document
                                .getElementById(
                                    "business-notifications"
                                )
                                ?.scrollIntoView({
                                    behavior:
                                        "smooth"
                                })
                        }

                        aria-label=
                            "Notifications"
                    >

                        🔔


                        {
                            unreadNotifications.length >
                            0 && (

                            <span
                                className=
                                    "business-notification-count"
                            >

                                {
                                    unreadNotifications.length >
                                    99

                                        ? "99+"

                                        : unreadNotifications.length
                                }

                            </span>

                        )}

                    </button>

                    <ThemeToggle/>

                    <button
                        className=
                            "business-profile-button"

                        onClick={() =>
                            navigate(
                                "/business/profile"
                            )
                        }
                    >
                        Profile
                    </button>


                    <button
                        className=
                            "business-logout-button"

                        onClick={() => {

                            const confirmed =
                                window.confirm(
                                    "Are you sure you want to logout?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            localStorage.removeItem(
                                "token"
                            );

                            localStorage.removeItem(
                                "accessToken"
                            );

                            localStorage.removeItem(
                                "user"
                            );

                            localStorage.removeItem(
                                "userType"
                            );

                            localStorage.removeItem(
                                "role"
                            );


                            sessionStorage.clear();


                            navigate(
                                "/business/login",
                                {
                                    replace:
                                        true
                                }
                            );

                        }}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {error && (

                <div
                    className=
                        "business-dashboard-error"
                >
                    {error}
                </div>

            )}


            <main
                className=
                    "business-dashboard-content"
            >


                {/* =================================================
                    FLEET OVERVIEW
                ================================================= */}

                <section
                    className=
                        "business-overview-section"
                >

                    <div
                        className=
                            "section-heading-row"
                    >

                        <div>

                            <p
                                className=
                                    "section-eyebrow"
                            >
                                FLEET OVERVIEW
                            </p>


                            <h2>
                                Today's fleet
                            </h2>

                        </div>


                        <div
                            className=
                                "business-fleet-actions"
                        >

                            <button
                                className=
                                    "business-shift-history-button"

                                onClick={() =>
                                    navigate(
                                        "/business/shifts"
                                    )
                                }
                            >
                                Shift History
                            </button>


                            <button
                                className=
                                    "primary-dashboard-button"

                                onClick={() =>
                                    navigate(
                                        "/business/vehicles"
                                    )
                                }
                            >
                                Manage Vehicles
                            </button>

                        </div>

                    </div>


                    <div
                        className=
                            "business-stat-grid"
                    >

                        <div
                            className=
                                "business-stat-card"
                        >

                            <span>
                                Total Vehicles
                            </span>

                            <strong>
                                {
                                    vehicles.length
                                }
                            </strong>

                            <small>
                                All vehicles in your fleet
                            </small>

                        </div>


                        <div
                            className=
                                "business-stat-card stat-running"
                        >

                            <span>
                                Running Vehicles
                            </span>

                            <strong>
                                {
                                    runningVehicles.length
                                }
                            </strong>

                            <small>
                                Vehicles with a shift in progress
                            </small>

                        </div>


                        <div
                            className=
                                "business-stat-card stat-not-started"
                        >

                            <span>
                                Not Started
                            </span>

                            <strong>
                                {
                                    notStartedCount
                                }
                            </strong>

                            <small>
                                Today's shifts not started
                            </small>

                        </div>


                        <div
                            className=
                                "business-stat-card stat-day-off"
                        >

                            <span>
                                Day Off
                            </span>

                            <strong>
                                {
                                    dayOffCount
                                }
                            </strong>

                            <small>
                                Today's reported day offs
                            </small>

                        </div>


                        <div
                            className=
                                "business-stat-card stat-completed"
                        >

                            <span>
                                Completed
                            </span>

                            <strong>
                                {
                                    completedVehicles.length
                                }
                            </strong>

                            <small>
                                Vehicles with completed shifts
                            </small>

                        </div>


                        <div
                            className=
                                "business-stat-card stat-pending"
                        >

                            <span>
                                Pending Rent
                            </span>

                            <strong>
                                {
                                    formatMoney(
                                        paymentSummary.totalPending
                                    )
                                }
                            </strong>

                            <small>
                                Outstanding across payment history
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TODAY'S OPERATIONS
                ================================================= */}

                <section
                    className=
                        "business-activity-section"
                >

                    <div
                        className=
                            "section-heading-row"
                    >

                        <div>

                            <p
                                className=
                                    "section-eyebrow"
                            >
                                TODAY'S OPERATIONS
                            </p>


                            <h2>
                                Vehicle activity
                            </h2>

                        </div>


                        <div
                            className=
                                "business-mini-summary"
                        >

                            <span>
                                {
                                    startedCount
                                }
                                {" "}
                                started
                            </span>


                            <span>
                                {
                                    dayOffCount
                                }
                                {" "}
                                day off
                            </span>


                            <span>
                                {
                                    notStartedCount
                                }
                                {" "}
                                not started
                            </span>

                        </div>

                    </div>


                    {
                        vehicleActivityRows.length ===
                        0 ? (

                            <div
                                className=
                                    "business-empty-card"
                            >

                                <h3>
                                    No vehicle activity today
                                </h3>


                                <p>
                                    No assigned vehicles have a shift recorded today.
                                </p>

                            </div>

                        ) : (

                            <div
                                className=
                                    "business-activity-container"
                            >

                                {/* SEARCH */}

                                <div
                                    className=
                                        "business-activity-toolbar"
                                >

                                    <div
                                        className=
                                            "business-activity-search"
                                    >

                                        <span>
                                            🔎
                                        </span>


                                        <input
                                            type="text"
                                            placeholder=
                                                "Search vehicle, driver or mobile..."
                                            value={
                                                activitySearch
                                            }
                                            onChange={(event) =>
                                                setActivitySearch(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {activitySearch && (

                                        <button
                                            className=
                                                "business-activity-clear"
                                            onClick={() => {
                                                setActivitySearch("");
                                                setActivityPage(1);
                                            }}
                                        >
                                            Clear
                                        </button>

                                    )}

                                </div>


                                {filteredActivityRows.length ===
                                0 ? (

                                    <div
                                        className=
                                            "business-activity-no-results"
                                    >
                                        No matching vehicle or driver found.
                                    </div>

                                ) : (

                                    <>

                                        <div
                                            className=
                                                "business-table-card business-activity-table-card"
                                        >

                                            <div
                                                className=
                                                    "business-table-wrapper"
                                            >

                                                <table
                                                    className=
                                                        "business-activity-table"
                                                >

                                                    <thead>

                                                        <tr>

                                                            <th>
                                                                Vehicle
                                                            </th>

                                                            <th>
                                                                Driver
                                                            </th>

                                                            <th>
                                                                Shift
                                                            </th>

                                                            <th>
                                                                Schedule
                                                            </th>

                                                            <th>
                                                                Status
                                                            </th>

                                                            <th>
                                                                Action
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {
                                                            paginatedActivityRows.map(
                                                                (row) => {

                                                                    const shift =
                                                                        row.shift;

                                                                    const assignment =
                                                                        row.assignment;


                                                                    const assignmentId =
                                                                        getAssignmentId(
                                                                            assignment,
                                                                            shift
                                                                        );


                                                                    const driverName =
                                                                        getDriverName(
                                                                            shift,
                                                                            assignment
                                                                        );


                                                                    const driverMobile =
                                                                        getDriverMobile(
                                                                            shift,
                                                                            assignment
                                                                        );


                                                                    const vehicleNumber =
                                                                        getVehicleNumber(
                                                                            shift,
                                                                            assignment,
                                                                            row.vehicleId
                                                                        );


                                                                    return (

                                                                        <tr
                                                                            key={
                                                                                shift._id
                                                                            }
                                                                        >

                                                                            <td
                                                                                className=
                                                                                    "vehicle-cell"
                                                                            >
                                                                                {
                                                                                    vehicleNumber
                                                                                }
                                                                            </td>


                                                                            <td>

                                                                                <strong>
                                                                                    {
                                                                                        driverName
                                                                                    }
                                                                                </strong>

                                                                            </td>


                                                                            <td>

                                                                                {
                                                                                    shift
                                                                                        ?.shiftType
                                                                                        ?.charAt(0)
                                                                                        ?.toUpperCase() +
                                                                                    shift
                                                                                        ?.shiftType
                                                                                        ?.slice(1)
                                                                                }

                                                                            </td>


                                                                            <td>

                                                                                {
                                                                                    formatTime(
                                                                                        shift.plannedStartTime
                                                                                    )
                                                                                }

                                                                                {" - "}

                                                                                {
                                                                                    formatTime(
                                                                                        shift.plannedEndTime
                                                                                    )
                                                                                }

                                                                            </td>


                                                                            <td>

                                                                                <span className={`vehicle-today-status ${shift.status || "not-started"}`}>
                                                                                    {getStatusLabel(shift.status)}
                                                                                </span>                                                                          </td>


                                                                            <td>

                                                                                <div
                                                                                    className=
                                                                                        "business-activity-actions"
                                                                                >

                                                                                    {
                                                                                        driverMobile && (

                                                                                            <button
                                                                                                className=
                                                                                                    "call-driver-button"
                                                                                                onClick={() =>
                                                                                                    callDriver(
                                                                                                        shift,
                                                                                                        assignment
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                📞 Call
                                                                                            </button>

                                                                                        )
                                                                                    }


                                                                                    {
                                                                                        assignmentId && (

                                                                                            <button
                                                                                                className=
                                                                                                    "view-assignment-dashboard-button"
                                                                                                onClick={() =>
                                                                                                    navigate(
                                                                                                        `/business/assignments/${assignmentId}`
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                View
                                                                                            </button>

                                                                                        )
                                                                                    }

                                                                                </div>

                                                                            </td>

                                                                        </tr>

                                                                    );

                                                                }
                                                            )
                                                        }

                                                    </tbody>

                                                </table>

                                            </div>

                                        </div>


                                        {totalActivityPages > 1 && (

                                            <div
                                                className=
                                                    "business-activity-pagination"
                                            >

                                                <span>
                                                    Showing{" "}
                                                    {
                                                        (
                                                            (
                                                                activityPage -
                                                                1
                                                            ) *
                                                            ACTIVITY_PAGE_SIZE
                                                        ) + 1
                                                    }
                                                    {" – "}
                                                    {
                                                        Math.min(
                                                            activityPage *
                                                            ACTIVITY_PAGE_SIZE,
                                                            filteredActivityRows.length
                                                        )
                                                    }
                                                    {" "}of{" "}
                                                    {
                                                        filteredActivityRows.length
                                                    }
                                                </span>


                                                <div>

                                                    <button
                                                        disabled={
                                                            activityPage === 1
                                                        }
                                                        onClick={() =>
                                                            setActivityPage(
                                                                (current) =>
                                                                    current - 1
                                                            )
                                                        }
                                                    >
                                                        ←
                                                    </button>


                                                    <strong>
                                                        {activityPage}
                                                        {" / "}
                                                        {totalActivityPages}
                                                    </strong>


                                                    <button
                                                        disabled={
                                                            activityPage ===
                                                            totalActivityPages
                                                        }
                                                        onClick={() =>
                                                            setActivityPage(
                                                                (current) =>
                                                                    current + 1
                                                            )
                                                        }
                                                    >
                                                        →
                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </>

                                )}

                            </div>

                        )

                    }

                </section>


                {/* =================================================
                    PAYMENTS + FLEET SUMMARY
                ================================================= */}

                <section
                    className=
                        "business-bottom-grid"
                >


                    {/* PAYMENT */}

                    <div
                        className=
                            "business-panel"
                    >

                        <div
                            className=
                                "panel-heading"
                        >

                            <div>

                                <p
                                    className=
                                        "section-eyebrow"
                                >
                                    PAYMENTS
                                </p>


                                <h2>
                                    Rent overview
                                </h2>

                            </div>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/business/payments"
                                    )
                                }
                            >
                                View Payments →
                            </button>

                        </div>


                        <div
                            className=
                                "payment-overview-grid"
                        >

                            <div>

                                <span>
                                    Total Due
                                </span>

                                <strong>
                                    {
                                        formatMoney(
                                            paymentSummary.totalDue
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total Paid
                                </span>

                                <strong>
                                    {
                                        formatMoney(
                                            paymentSummary.totalPaid
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {
                                        formatMoney(
                                            paymentSummary.totalPending
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* FLEET SUMMARY */}

                    <div
                        className=
                            "business-panel"
                    >

                        <div
                            className=
                                "panel-heading"
                        >

                            <div>

                                <p
                                    className=
                                        "section-eyebrow"
                                >
                                    FLEET STATUS
                                </p>


                                <h2>
                                    Vehicle summary
                                </h2>

                            </div>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/business/vehicles"
                                    )
                                }
                            >
                                View Fleet →
                            </button>

                        </div>


                        <div
                            className=
                                "vehicle-summary-list"
                        >

                            <div>

                                <span>
                                    Active Vehicles
                                </span>

                                <strong>
                                    {
                                        activeVehicles.length
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Assigned Vehicles
                                </span>

                                <strong>
                                    {
                                        assignedActiveVehicleCount
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Available Vehicles
                                </span>

                                <strong>
                                    {
                                        availableActiveVehicleCount
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section
                    className=
                        "business-panel business-notifications-panel"
                    id=
                        "business-notifications"
                >

                    <div
                        className=
                            "panel-heading"
                    >

                        <div>

                            <p
                                className=
                                    "section-eyebrow"
                            >
                                ALERTS
                            </p>


                            <h2>
                                Notifications
                            </h2>

                        </div>


                        {
                            unreadNotifications.length >
                            0 && (

                                <button
                                    onClick={
                                        async () => {

                                            try {

                                                await api.put(
                                                    "/notifications/read-all"
                                                );


                                                setNotifications(
                                                    (current) =>

                                                        current.map(
                                                            (item) => ({

                                                                ...item,

                                                                isRead:
                                                                    true

                                                            })
                                                        )

                                                );

                                            } catch (
                                                err
                                            ) {

                                                console.error(
                                                    "Mark All Read Error:",
                                                    err
                                                );

                                            }

                                        }
                                    }
                                >
                                    Mark all as read
                                </button>

                            )
                        }

                    </div>


                    {
                        notifications.length ===
                        0 ? (

                            <div
                                className=
                                    "notification-empty"
                            >

                                <span>
                                    🔔
                                </span>

                                <p>
                                    No notifications yet.
                                </p>

                            </div>

                        ) : (

                            <div
                                className=
                                    "notification-list"
                            >

                                {
                                    notifications
                                        .slice(
                                            0,
                                            8
                                        )
                                        .map(
                                            (
                                                notification
                                            ) => (

                                                <button
                                                    key={
                                                        notification._id
                                                    }

                                                    className={

                                                        `business-notification-item ${
                                                            notification.isRead
                                                                ? "read"
                                                                : "unread"
                                                        }`

                                                    }

                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification
                                                        )
                                                    }
                                                >

                                                    <span
                                                        className=
                                                            "notification-dot"
                                                    />


                                                    <span
                                                        className=
                                                            "notification-copy"
                                                    >

                                                        <strong>
                                                            {
                                                                notification.title
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                notification.message
                                                            }
                                                        </span>


                                                        <small>
                                                            {
                                                                formatDate(
                                                                    notification.createdAt
                                                                )
                                                            }
                                                        </small>

                                                    </span>


                                                    {
                                                        notification.type ===
                                                        "day_off" && (

                                                            <span
                                                                className=
                                                                    "notification-badge"
                                                            >
                                                                DAY OFF
                                                            </span>

                                                        )
                                                    }

                                                </button>

                                            )
                                        )
                                }

                            </div>

                        )
                    }

                </section>

            </main>

            <AppFooter
                section="Business Dashboard"
            />
            
        </div>

    );

}


export default BusinessDashboard;