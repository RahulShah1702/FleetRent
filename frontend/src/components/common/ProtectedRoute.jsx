import { Navigate, Outlet } from "react-router-dom";

import {
    getToken,
    getRole,
    getUser
} from "../../utils/auth";


function ProtectedRoute({ role, requireProfile = false }) {

    const token = getToken();
    const user = getUser();
    const currentRole = getRole();


    // ============================================================
    // 1. User is not logged in
    // ============================================================

    if (!token) {

        if (role === "driver") {
            return (
                <Navigate
                    to="/driver/login"
                    replace
                />
            );
        }

        if (role === "business") {
            return (
                <Navigate
                    to="/business/login"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // ============================================================
    // 2. Wrong role
    // ============================================================

    if (role && currentRole !== role) {

        if (currentRole === "driver") {
            return (
                <Navigate
                    to="/driver/dashboard"
                    replace
                />
            );
        }

        if (currentRole === "business") {
            return (
                <Navigate
                    to="/business/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    // ============================================================
    // 3. Profile completion check
    // ============================================================

    if (
        requireProfile &&
        user?.profileComplete === false
    ) {

        if (role === "driver") {
            return (
                <Navigate
                    to="/driver/complete-profile"
                    replace
                />
            );
        }

        if (role === "business") {
            return (
                <Navigate
                    to="/business/complete-profile"
                    replace
                />
            );
        }
    }


    // ============================================================
    // 4. Everything is okay
    // ============================================================

    return <Outlet />;
}


export default ProtectedRoute;