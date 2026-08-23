import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { enablePushNotifications } from "../../utils/pushNotifications";

import api from "../../services/api";
import "./DriverDashboard.css";
import AppFooter
    from "../../components/common/AppFooter";

import ThemeToggle
    from "../../components/common/ThemeToggle";



function DriverDashboard() {

    const navigate = useNavigate();

    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


//logout function
    const handleLogout = () => {

    logout();

    navigate(
        "/driver/login",
        {
            replace: true
        }
    );
};



    // ============================================================
    // LOAD DRIVER PROFILE
    // ============================================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response =
                    await api.get(
                        "/driver/profile"
                    );

                setDriver(
                    response.data.driver
                );

            } catch (error) {

                console.error(
                    "Driver Dashboard Error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard."
                );

            } finally {

                setLoading(false);
            }
        };


        loadDashboard();

    }, []);

    const handleEnableNotifications = async () => {

    const success =
        await enablePushNotifications();

    if (success) {

        alert(
            "FleetRent notifications enabled."
        );

    } else {

        alert(
            "Unable to enable notifications."
        );

    }

};


    if (loading) {

        return (
            <div className="driver-dashboard">

                <div className="dashboard-loading">
                    Loading dashboard...
                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="driver-dashboard">

                <div className="dashboard-error">
                    {error}
                </div>

                <button
                    className="dashboard-back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>
        );
    }


    return (

        <div className="driver-dashboard">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="driver-dashboard-header">

                <div>

                    <p className="dashboard-eyebrow">
                        FleetRent
                    </p>

                    <h1>
                        Driver Dashboard
                    </h1>

                    <p className="dashboard-welcome">
                        Welcome back,{" "}
                        <strong>
                            {driver?.fullName}
                        </strong>
                    </p>

                </div>

                <button
                    className="notification-bell-button"
                    onClick={handleEnableNotifications}
                    title="Enable notifications"
                    aria-label="Enable notifications"
                >
                    🔔
                </button>


                <div className="dashboard-header-actions">

                    <button
                        className="profile-button"
                        onClick={() =>
                            navigate("/driver/profile")
                        }
                    >
                        Personal Profile
                    </button>
                    
                    
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                    <ThemeToggle />
                    
                </div>

            </header>


            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <main className="driver-dashboard-content">

                <section className="dashboard-section">

                    <h2>
                        Quick Access
                    </h2>

                    <div className="dashboard-grid">

                        {/* CURRENT ASSIGNMENT */}

                        <button
                            className="dashboard-card"
                            onClick={() =>
                                navigate(
                                    "/driver/assignment"
                                )
                            }
                        >

                            <div className="dashboard-card-icon">
                                🚗
                            </div>

                            <div>
                                <h3>
                                    Current Assignment
                                </h3>

                                <p>
                                    View your assigned
                                    vehicle and assignment
                                    details.
                                </p>
                            </div>

                            <span className="card-arrow">
                                →
                            </span>

                        </button>


                        {/* SHIFT */}

                        <button
                            className="dashboard-card"
                            onClick={() =>
                                navigate(
                                    "/driver/shifts"
                                )
                            }
                        >

                            <div className="dashboard-card-icon">
                                🕒
                            </div>

                            <div>
                                <h3>
                                    Shift
                                </h3>

                                <p>
                                    View and manage your
                                    current shift.
                                </p>
                            </div>

                            <span className="card-arrow">
                                →
                            </span>

                        </button>


                        {/* SHIFT HISTORY */}

                        <button
                            className="dashboard-card"
                            onClick={() =>
                                navigate(
                                    "/driver/shift-history"
                                )
                            }
                        >

                            <div className="dashboard-card-icon">
                                📋
                            </div>

                            <div>
                                <h3>
                                    Shift History
                                </h3>

                                <p>
                                    View your previous
                                    shifts.
                                </p>
                            </div>

                            <span className="card-arrow">
                                →
                            </span>

                        </button>


                        {/* PAYMENTS */}

                        <button
                            className="dashboard-card"
                            onClick={() =>
                                navigate(
                                    "/driver/payments"
                                )
                            }
                        >

                            <div className="dashboard-card-icon">
                                ₹
                            </div>

                            <div>
                                <h3>
                                    Payments
                                </h3>

                                <p>
                                    View dues and payment
                                    history.
                                </p>
                            </div>

                            <span className="card-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </section>


                {/* PROFILE */}

                <section className="profile-summary">

                    <div>

                        <h2>
                            Profile
                        </h2>

                        <p>
                            {driver?.fullName}<d>  |  </d>
                            {driver?.mobileNumber}<d>  |  </d>
                            {driver?.email}
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/driver/profile"
                            )
                        }
                    >
                        View Profile
                    </button>

                </section>

            </main>


            {/* ====================================================
                FOOTER
            ==================================================== */}

            <AppFooter
                section="Driver Dashboard"
            />

        </div>
    );
}


export default DriverDashboard;