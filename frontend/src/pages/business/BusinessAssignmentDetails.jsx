import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../../services/api";

import "./BusinessAssignmentDetails.css";


function BusinessAssignmentDetails() {

    const {
        id
    } = useParams();

    const navigate =
        useNavigate();


    const [assignment, setAssignment] =
        useState(null);

    const [todayShift, setTodayShift] =
        useState(null);

    const [payment, setPayment] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ============================================================
    // LOAD ASSIGNMENT
    // ============================================================

    const loadAssignment = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                assignmentsResponse,
                shiftsResponse,
                paymentsResponse
            ] = await Promise.all([

                api.get(
                    "/assignments"
                ),

                api.get(
                    "/shifts/business"
                ),

                api.get(
                    "/payments/business"
                )

            ]);


            const assignments =
                assignmentsResponse
                    .data
                    .assignments ||
                [];


            const foundAssignment =
                assignments.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(id)
                );


            if (!foundAssignment) {

                setError(
                    "Assignment not found."
                );

                setAssignment(null);

                return;

            }


            setAssignment(
                foundAssignment
            );


            // --------------------------------------------------------
            // TODAY'S SHIFT
            // --------------------------------------------------------

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            const tomorrow =
                new Date(today);

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );


            const shifts =
                shiftsResponse
                    .data
                    .shifts ||
                [];


            const matchingShift =
                shifts.find(
                    (shift) => {

                        const shiftAssignmentId =
                            shift.assignmentId?._id ||
                            shift.assignmentId;


                        if (
                            String(
                                shiftAssignmentId
                            ) !==
                            String(
                                foundAssignment._id
                            )
                        ) {
                            return false;
                        }


                        if (
                            !shift.shiftDate
                        ) {
                            return false;
                        }


                        const shiftDate =
                            new Date(
                                shift.shiftDate
                            );


                        return (
                            shiftDate >= today &&
                            shiftDate < tomorrow
                        );

                    }
                );


            setTodayShift(
                matchingShift ||
                null
            );


            // --------------------------------------------------------
            // PAYMENT
            // --------------------------------------------------------

            const payments =
                paymentsResponse
                    .data
                    .payments ||
                [];


            const matchingPayment =
                payments.find(
                    (item) =>
                        String(
                            item.assignmentId?._id ||
                            item.assignmentId
                        ) ===
                        String(
                            foundAssignment._id
                        )
                );


            setPayment(
                matchingPayment ||
                null
            );


        } catch (err) {

            console.error(
                "Assignment Details Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load assignment details."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadAssignment();

    }, [id]);


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
                )}:` +
                `${match[2]} ` +
                `${match[3]}`
            );

        }


        return text;

    };


    // ============================================================
    // STATUS
    // ============================================================

    const getShiftStatus = () => {

        if (!todayShift) {
            return {
                label: "No Shift Today",
                className: "no-shift"
            };
        }


        switch (
            todayShift.status
        ) {

            case "in-progress":

                return {
                    label: "Running",
                    className: "running"
                };


            case "completed":

                return {
                    label: "Completed",
                    className: "completed"
                };


            case "day-off":

                return {
                    label: "Day Off",
                    className: "day-off"
                };


            case "not-started":

                return {
                    label: "Not Started",
                    className: "not-started"
                };


            default:

                return {
                    label: "Unknown",
                    className: "unknown"
                };

        }

    };


    // ============================================================
    // CALL DRIVER
    // ============================================================

    const callDriver = () => {

        const mobile =
            assignment
                ?.driverId
                ?.mobileNumber;


        if (!mobile) {

            setError(
                "Driver mobile number is not available."
            );

            return;

        }


        window.location.href =
            `tel:${mobile}`;

    };


    // ============================================================
    // CALL REFERENCE
    // ============================================================

    const callReference = () => {

        const mobile =
            assignment
                ?.referenceMobileNumber;


        if (!mobile) {

            setError(
                "Reference mobile number is not available."
            );

            return;

        }


        window.location.href =
            `tel:${mobile}`;

    };


    // ============================================================
    // END ASSIGNMENT
    // ============================================================

    const handleEndAssignment =
        async () => {

            if (!assignment) {
                return;
            }


            const confirmed =
                window.confirm(

                    `End the assignment of ${
                        assignment.driverId
                            ?.fullName ||
                        "this driver"
                    } for ${
                        assignment.vehicleId
                            ?.registrationNumber ||
                        "this vehicle"
                    }?`

                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(
                    true
                );

                setError("");

                setSuccess("");


                await api.put(

                    `/assignments/${assignment._id}/end`

                );


                setSuccess(
                    "Assignment ended successfully."
                );


                await loadAssignment();


            } catch (err) {

                console.error(
                    "End Assignment Error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Unable to end assignment."
                );

            } finally {

                setActionLoading(
                    false
                );

            }

        };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className=
                    "business-assignment-page"
            >

                <div
                    className=
                        "assignment-loading"
                >
                    Loading assignment...
                </div>

            </div>

        );

    }


    // ============================================================
    // NOT FOUND
    // ============================================================

    if (!assignment) {

        return (

            <div
                className=
                    "business-assignment-page"
            >

                <button
                    className=
                        "assignment-back-button"

                    onClick={() =>
                        navigate(
                            "/business/vehicles"
                        )
                    }
                >
                    ← Back to Vehicles
                </button>


                <div
                    className=
                        "assignment-error-card"
                >

                    <h2>
                        Assignment Not Found
                    </h2>

                    <p>
                        {
                            error ||
                            "This assignment may have already been removed."
                        }
                    </p>

                </div>

            </div>

        );

    }


    const shiftStatus =
        getShiftStatus();


    const driver =
        assignment.driverId;

    const vehicle =
        assignment.vehicleId;


    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <div
            className=
                "business-assignment-page"
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className=
                    "assignment-header"
            >

                <div>

                    <button
                        className=
                            "assignment-back-button"

                        onClick={() =>
                            navigate(
                                "/business/vehicles"
                            )
                        }
                    >
                        ← Back to Vehicles
                    </button>


                    <p
                        className=
                            "assignment-eyebrow"
                    >
                        FLEETRENT
                    </p>


                    <h1>
                        Assignment Details
                    </h1>


                    <p
                        className=
                            "assignment-subtitle"
                    >
                        View the driver, vehicle, shift and payment information.
                    </p>

                </div>


                <div
                    className=
                        "assignment-header-status"
                >

                    <span
                        className={
                            `assignment-status-badge ${
                                assignment.status
                            }`
                        }
                    >

                        {
                            assignment.status ===
                            "active"
                                ? "Active Assignment"
                                : "Completed Assignment"
                        }

                    </span>

                </div>

            </header>


            {/* ALERTS */}

            {error && (

                <div
                    className=
                        "assignment-alert assignment-error"
                >
                    {error}
                </div>

            )}


            {success && (

                <div
                    className=
                        "assignment-alert assignment-success"
                >
                    {success}
                </div>

            )}


            {/* ====================================================
                MAIN GRID
            ==================================================== */}

            <main
                className=
                    "assignment-content"
            >


                {/* =================================================
                    VEHICLE + DRIVER
                ================================================= */}

                <section
                    className=
                        "assignment-primary-grid"
                >

                    <div
                        className=
                            "assignment-card"
                    >

                        <div
                            className=
                                "assignment-card-heading"
                        >

                            <div>

                                <span>
                                    VEHICLE
                                </span>

                                <h2>
                                    {
                                        vehicle
                                            ?.registrationNumber ||
                                        "—"
                                    }
                                </h2>

                            </div>


                            <div
                                className=
                                    "assignment-vehicle-icon"
                            >
                                🚗
                            </div>

                        </div>


                        <div
                            className=
                                "assignment-detail-list"
                        >

                            <div>

                                <span>
                                    Engine Number
                                </span>

                                <strong>
                                    {
                                        vehicle
                                            ?.engineNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Chassis Number
                                </span>

                                <strong>
                                    {
                                        vehicle
                                            ?.chassisNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Assignment Start
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            assignment.startDate
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Daily Rent
                                </span>

                                <strong
                                    className=
                                        "assignment-money"
                                >
                                    ₹
                                    {
                                        Number(
                                            assignment.dailyRent ||
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div
                        className=
                            "assignment-card"
                    >

                        <div
                            className=
                                "assignment-card-heading"
                        >

                            <div>

                                <span>
                                    DRIVER
                                </span>

                                <h2>
                                    {
                                        driver
                                            ?.fullName ||
                                        "—"
                                    }
                                </h2>

                            </div>


                            <div
                                className=
                                    "assignment-driver-avatar"
                            >
                                {
                                    driver
                                        ?.fullName
                                        ?.charAt(
                                            0
                                        )
                                        ?.toUpperCase() ||
                                    "D"
                                }
                            </div>

                        </div>


                        <div
                            className=
                                "assignment-detail-list"
                        >

                            <div>

                                <span>
                                    Mobile Number
                                </span>

                                <strong>
                                    {
                                        driver
                                            ?.mobileNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        driver
                                            ?.email ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Driving Licence
                                </span>

                                <strong>
                                    {
                                        driver
                                            ?.drivingLicenseNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>

                        </div>


                        {driver?.mobileNumber && (

                            <button
                                className=
                                    "assignment-call-button"

                                onClick={
                                    callDriver
                                }
                            >
                                📞 Call Driver
                            </button>

                        )}

                    </div>

                </section>


                {/* =================================================
                    SHIFT
                ================================================= */}

                <section
                    className=
                        "assignment-card assignment-shift-card"
                >

                    <div
                        className=
                            "assignment-section-header"
                    >

                        <div>

                            <span>
                                SHIFT
                            </span>

                            <h2>
                                {
                                    assignment.shift
                                        ?.charAt(0)
                                        ?.toUpperCase() +
                                    assignment.shift
                                        ?.slice(1)
                                }
                            </h2>

                        </div>


                        <span
                            className={
                                `assignment-shift-status ${
                                    shiftStatus.className
                                }`
                            }
                        >
                            {
                                shiftStatus.label
                            }
                        </span>

                    </div>


                    <div
                        className=
                            "shift-timeline"
                    >

                        <div>

                            <span>
                                Scheduled Start
                            </span>

                            <strong>
                                {
                                    formatTime(
                                        assignment.shiftStartTime
                                    )
                                }
                            </strong>

                        </div>


                        <div
                            className=
                                "shift-line"
                        />


                        <div>

                            <span>
                                Scheduled End
                            </span>

                            <strong>
                                {
                                    formatTime(
                                        assignment.shiftEndTime
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {todayShift && (

                        <div
                            className=
                                "today-shift-details"
                        >

                            <div>

                                <span>
                                    Actual Start
                                </span>

                                <strong>
                                    {
                                        todayShift.actualStartTime
                                            ? formatDate(
                                                todayShift.actualStartTime
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
                                        todayShift.actualEndTime
                                            ? formatDate(
                                                todayShift.actualEndTime
                                            )
                                            : "—"
                                    }
                                </strong>

                            </div>


                            {todayShift.status ===
                                "day-off" && (

                                <div>

                                    <span>
                                        Day-Off Reason
                                    </span>

                                    <strong>
                                        {
                                            todayShift.dayOffReason ||
                                            "Not provided"
                                        }
                                    </strong>

                                </div>

                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    REFERENCE
                ================================================= */}

                <section
                    className=
                        "assignment-card"
                >

                    <div
                        className=
                            "assignment-section-header"
                    >

                        <div>

                            <span>
                                REFERENCE
                            </span>

                            <h2>
                                Known Contact
                            </h2>

                        </div>

                    </div>


                    <div
                        className=
                            "reference-contact"
                    >

                        <div
                            className=
                                "reference-avatar"
                        >
                            👤
                        </div>


                        <div
                            className=
                                "reference-info"
                        >

                            <strong>
                                {
                                    assignment.referenceName ||
                                    "No reference provided"
                                }
                            </strong>

                            <span>
                                {
                                    assignment.referenceMobileNumber ||
                                    "No mobile number"
                                }
                            </span>

                        </div>


                        {assignment.referenceMobileNumber && (

                            <button
                                className=
                                    "reference-call-button"

                                onClick={
                                    callReference
                                }
                            >
                                📞 Call Reference
                            </button>

                        )}

                    </div>

                </section>


                {/* =================================================
                    PAYMENT
                ================================================= */}

                <section
                    className=
                        "assignment-card"
                >

                    <div
                        className=
                            "assignment-section-header"
                    >

                        <div>

                            <span>
                                PAYMENT
                            </span>

                            <h2>
                                Daily Rent
                            </h2>

                        </div>


                        <span
                            className={
                                `assignment-payment-status ${
                                    payment?.status ||
                                    "not-created"
                                }`
                            }
                        >
                            {
                                payment?.status ===
                                "paid"

                                    ? "Paid"

                                    : payment

                                        ? "Pending"

                                        : "Not Created"
                            }
                        </span>

                    </div>


                    <div
                        className=
                            "assignment-payment-grid"
                    >

                        <div>

                            <span>
                                Amount Due
                            </span>

                            <strong>
                                ₹
                                {
                                    Number(
                                        payment?.dueAmount ??
                                        assignment.dailyRent ??
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Paid
                            </span>

                            <strong
                                className=
                                    "paid-value"
                            >
                                ₹
                                {
                                    Number(
                                        payment?.paidAmount ||
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Remaining
                            </span>

                            <strong
                                className=
                                    "remaining-value"
                            >
                                ₹
                                {
                                    Number(
                                        (
                                            payment?.dueAmount ??
                                            assignment.dailyRent ??
                                            0
                                        ) -
                                        (
                                            payment?.paidAmount ||
                                            0
                                        )
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                {assignment.status ===
                    "active" && (

                    <section
                        className=
                            "assignment-actions"
                    >

                        <button
                            className=
                                "assignment-history-button"

                            onClick={() =>
                                navigate(
                                    `/business/shifts?vehicleId=${vehicle?._id}&assignmentId=${assignment?._id}`
                                )
                            }
                        >
                            View Shift History
                        </button>


                        <button
                            className=
                                "assignment-end-button"

                            onClick={
                                handleEndAssignment
                            }

                            disabled={
                                actionLoading
                            }
                        >
                            {
                                actionLoading
                                    ? "Ending Assignment..."
                                    : "End Assignment"
                            }
                        </button>

                    </section>

                )}

            </main>

        </div>

    );

}


export default BusinessAssignmentDetails;