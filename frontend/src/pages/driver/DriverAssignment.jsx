import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./DriverAssignment.css";


function DriverAssignment() {

    const navigate = useNavigate();

    const [assignment, setAssignment] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ============================================================
    // LOAD CURRENT ASSIGNMENT
    // ============================================================

    useEffect(() => {

        const loadAssignment = async () => {

            try {

                const response =
                    await api.get(
                        "/assignments/my"
                    );

                setAssignment(
                    response.data.assignment
                );

            } catch (error) {

                console.error(
                    "Load Assignment Error:",
                    error
                );


                if (
                    error.response?.status === 404
                ) {

                    setError(
                        "You currently have no active vehicle assignment."
                    );

                } else {

                    setError(
                        error.response?.data?.message ||
                        "Unable to load assignment."
                    );
                }

            } finally {

                setLoading(false);
            }
        };


        loadAssignment();

    }, []);


    // ============================================================
    // DATE FORMATTER
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    };


    // ============================================================
    // SHIFT FORMATTER
    // ============================================================

    const formatShift = (shift) => {

        if (!shift) {
            return "—";
        }

        return shift
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    // ============================================================
// CALL BUSINESS OWNER
// ============================================================

const handleCallOwner = () => {

    const ownerNumber =
        assignment?.businessId?.mobileNumber;

    if (!ownerNumber) {

        setError(
            "Business owner phone number is not available."
        );

        return;
    }

    window.location.href =
        `tel:${ownerNumber}`;
};


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="assignment-page">

                <div className="assignment-container">

                    <button
                        type="button"
                        className="assignment-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="assignment-loading">
                        Loading assignment...
                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // NO ASSIGNMENT / ERROR
    // ============================================================

    if (error || !assignment) {

        return (

            <div className="assignment-page">

                <div className="assignment-container">

                    <button
                        type="button"
                        className="assignment-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="assignment-empty-card">

                        <div className="assignment-empty-icon">
                            🚗
                        </div>

                        <h2>
                            No Active Assignment
                        </h2>

                        <p>
                            {error ||
                                "You currently have no active vehicle assignment."}
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    const vehicle =
        assignment.vehicleId;

    const business =
        assignment.businessId;


    return (

        <div className="assignment-page">

            <div className="assignment-container">


                {/* ====================================================
                    BACK
                ==================================================== */}

                <button
                    type="button"
                    className="assignment-back-button"
                    onClick={() =>
                        navigate(
                            "/driver/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>


                {/* ====================================================
                    PAGE HEADER
                ==================================================== */}

                <div className="assignment-page-header">

                    <div>

                        <p className="assignment-eyebrow">
                            FleetRent
                        </p>

                        <h1>
                            Current Assignment
                        </h1>

                        <p>
                            View your current vehicle
                            and shift details.
                        </p>

                    </div>


                    <span className="assignment-status">
                        Active
                    </span>

                </div>


                {/* ====================================================
                    VEHICLE
                ==================================================== */}

                <section className="assignment-section">

                    <div className="section-heading">

                        <div className="section-icon">
                            🚗
                        </div>

                        <div>

                            <h2>
                                Vehicle Details
                            </h2>

                            <p>
                                Vehicle currently assigned
                                to you.
                            </p>

                        </div>

                    </div>


                    <div className="assignment-details-grid">


                        <div className="assignment-detail">

                            <span>
                                Registration Number
                            </span>

                            <strong>
                                {vehicle?.registrationNumber ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Vehicle Status
                            </span>

                            <strong className="active-text">
                                {vehicle?.status
                                    ? formatShift(
                                        vehicle.status
                                    )
                                    : "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Engine Number
                            </span>

                            <strong>
                                {vehicle?.engineNumber ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Chassis Number
                            </span>

                            <strong>
                                {vehicle?.chassisNumber ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Insurance Valid Until
                            </span>

                            <strong>
                                {formatDate(
                                    vehicle?.insuranceEndDate
                                )}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                PUC Valid Until
                            </span>

                            <strong>
                                {formatDate(
                                    vehicle?.pucEndDate
                                )}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Maintenance Date
                            </span>

                            <strong>
                                {formatDate(
                                    vehicle?.maintenanceDate
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ====================================================
                    ASSIGNMENT DETAILS
                ==================================================== */}

                <section className="assignment-section">

                    <div className="section-heading">

                        <div className="section-icon">
                            🕒
                        </div>

                        <div>

                            <h2>
                                Assignment Details
                            </h2>

                            <p>
                                Your shift and rental
                                information.
                            </p>

                        </div>

                    </div>


                    <div className="assignment-details-grid">


                        <div className="assignment-detail">

                            <span>
                                Shift
                            </span>

                            <strong>
                                {formatShift(
                                    assignment.shift
                                )}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Shift Start
                            </span>

                            <strong>
                                {assignment.shiftStartTime ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Shift End
                            </span>

                            <strong>
                                {assignment.shiftEndTime ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Daily Rent
                            </span>

                            <strong className="rent-value">

                                ₹
                                {Number(
                                    assignment.dailyRent ||
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Assignment Started
                            </span>

                            <strong>
                                {formatDate(
                                    assignment.startDate
                                )}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Status
                            </span>

                            <strong className="active-text">
                                {formatShift(
                                    assignment.status
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ====================================================
                    BUSINESS DETAILS
                ==================================================== */}

                <section className="assignment-section">

                    <div className="section-heading">

                        <div className="section-icon">
                            🏢
                        </div>

                        <div>

                            <h2>
                                Business Details
                            </h2>

                            <p>
                                Business responsible for
                                this vehicle assignment.
                            </p>

                        </div>

                    </div>


                    <div className="assignment-details-grid">


                        <div className="assignment-detail">

                            <span>
                                Business Name
                            </span>

                            <strong>
                                {business?.businessName ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Owner / Contact Person
                            </span>

                            <strong>
                                {business?.fullName ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Mobile Number
                            </span>

                            <strong>
                                {business?.mobileNumber ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Email
                            </span>

                            <strong>
                                {business?.email ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="assignment-detail">

                            <span>
                                Location
                            </span>

                            <strong>

                                {business?.city ||
                                business?.state
                                    ? `${business?.city || ""}${
                                        business?.city &&
                                        business?.state
                                            ? ", "
                                            : ""
                                    }${business?.state || ""}`
                                    : "—"}

                            </strong>

                            {assignment?.businessId && (

    <div className="business-contact-card">

        <div>

            <span>
                Business
            </span>

            <strong>
                {
                    assignment.businessId.businessName ||
                    assignment.businessId.fullName ||
                    "Business Owner"
                }
            </strong>

        </div>


        {assignment.businessId.mobileNumber && (

            <button
                type="button"
                className="call-owner-button"
                onClick={handleCallOwner}
            >
                📞 Call Owner
            </button>

        )}

    </div>

)}

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}


export default DriverAssignment;