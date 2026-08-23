import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


// ============================================================
// PUBLIC
// ============================================================

import LandingPage
    from "./pages/LandingPage";


// ============================================================
// AUTH
// ============================================================

import DriverLogin
    from "./pages/auth/DriverLogin";

import DriverRegister
    from "./pages/auth/DriverRegister";

import BusinessLogin
    from "./pages/auth/BusinessLogin";

import BusinessRegister
    from "./pages/auth/BusinessRegister";


// ============================================================
// COMMON
// ============================================================

import ProtectedRoute
    from "./components/common/ProtectedRoute";

import {
    ThemeProvider
} from "./context/ThemeContext";

// ============================================================
// DRIVER PAGES
// ============================================================

import DriverDashboard
    from "./pages/driver/DriverDashboard";

import DriverProfile
    from "./pages/driver/DriverProfile";

import DriverCompleteProfile
    from "./pages/driver/DriverCompleteProfile";

import DriverAssignment
    from "./pages/driver/DriverAssignment";

import DriverShift
    from "./pages/driver/DriverShift";

import DriverShiftHistory
    from "./pages/driver/DriverShiftHistory";

import DriverPayments
    from "./pages/driver/DriverPayments";


// ============================================================
// BUSINESS PAGES
// ============================================================

import BusinessCompleteProfile
    from "./pages/business/BusinessCompleteProfile";

import BusinessDashboard
    from "./pages/business/BusinessDashboard";

import BusinessProfile
    from "./pages/business/BusinessProfile";

import Vehicle
    from "./pages/business/Vehicle";

import BusinessAssignmentDetails
    from "./pages/business/BusinessAssignmentDetails";

import BusinessShiftHistory
    from "./pages/business/BusinessShiftHistory";

import Payment
    from "./pages/business/Payment";

import ForgotPassword
    from "./pages/auth/ForgotPassword";


// ============================================================
// PLACEHOLDER
// ============================================================

function Placeholder({ title }) {

    return (
        <div style={{ padding: "40px" }}>

            <h1>{title}</h1>

            <p>
                Page coming next...
            </p>

        </div>
    );
}


// ============================================================
// APP
// ============================================================

function App() {

    return (

        <ThemeProvider>
        <BrowserRouter>

            <Routes>


                {/* ==================================================
                    PUBLIC
                ================================================== */}

                <Route
                    path="/"
                    element={
                        <LandingPage />
                    }
                />


                {/* ==================================================
                    DRIVER AUTH
                ================================================== */}

                <Route
                    path="/driver/login"
                    element={
                        <DriverLogin />
                    }
                />

                <Route
                    path="/driver/register"
                    element={
                        <DriverRegister />
                    }
                />


                {/* ==================================================
                    DRIVER - PROFILE SETUP
                ================================================== */}

                <Route
                    element={
                        <ProtectedRoute
                            role="driver"
                        />
                    }
                >

                    <Route
                        path="/driver/complete-profile"
                        element={
                            <DriverCompleteProfile />
                        }
                    />

                </Route>


                {/* ==================================================
                    DRIVER - PROTECTED
                ================================================== */}

                <Route
                    element={
                        <ProtectedRoute
                            role="driver"
                            requireProfile={true}
                        />
                    }
                >

                    {/* Dashboard */}

                    <Route
                        path="/driver/dashboard"
                        element={
                            <DriverDashboard />
                        }
                    />


                    {/* Profile */}

                    <Route
                        path="/driver/profile"
                        element={
                            <DriverProfile />
                        }
                    />


                    {/* Assignment */}

                    <Route
                        path="/driver/assignment"
                        element={
                            <DriverAssignment />
                        }
                    />


                    {/* Shifts */}

                    <Route
                        path="/driver/shifts"
                        element={
                            <DriverShift />
                        }
                    />


                    {/* Shift History */}

                    <Route
                        path="/driver/shift-history"
                        element={
                            <DriverShiftHistory />
                        }
                    />


                    {/* Payments */}

                    <Route
                        path="/driver/payments"
                        element={
                            <DriverPayments />
                        }
                    />

                </Route>


                {/* ==================================================
                    BUSINESS AUTH
                ================================================== */}

                <Route
                    path="/business/login"
                    element={
                        <BusinessLogin />
                    }
                />

                <Route
                    path="/business/register"
                    element={
                        <BusinessRegister />
                    }
                />


                {/* ==================================================
                    BUSINESS - PROFILE SETUP
                ================================================== */}

                <Route
                    element={
                        <ProtectedRoute
                            role="business"
                        />
                    }
                >

                    <Route
                        path="/business/complete-profile"
                        element={
                            <BusinessCompleteProfile />
                        }
                    />

                </Route>


                {/* ==================================================
                    BUSINESS - PROTECTED
                ================================================== */}

                <Route
                    element={
                        <ProtectedRoute
                            role="business"
                            requireProfile={true}
                        />
                    }
                >

                    {/* Dashboard */}

                    <Route
                        path="/business/dashboard"
                        element={
                            <BusinessDashboard />
                        }
                    />


                    {/* Vehicles */}

                    <Route
                        path="/business/vehicles"
                        element={
                            <Vehicle />
                        }
                    />


                    {/* Profile */}

                    <Route
                        path="/business/profile"
                        element={
                            <BusinessProfile />
                        }
                    />

                    <Route
                        path="/business/assignments/:id"
                        element={
                            <BusinessAssignmentDetails />
                        }
                    />

                    <Route
                        path="/business/shifts"
                        element={
                            <BusinessShiftHistory />
                        }
                    />

                    <Route
                        path="/business/payments"
                        element={
                            <Payment />
                        }
                    />

                </Route>

                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />
                {/* ==================================================
                    404 - MUST BE LAST
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Placeholder
                            title="Page Not Found"
                        />
                    }
                />


            </Routes>

        </BrowserRouter>

        </ThemeProvider>

    );
}


export default App;