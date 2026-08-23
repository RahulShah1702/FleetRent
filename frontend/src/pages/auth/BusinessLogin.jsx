import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    loginBusiness,
    googleBusinessLogin
} from "../../services/authService";

import { saveAuth } from "../../utils/auth";
import api from "../../services/api";
import GoogleButton from "../../components/common/GoogleButton";
import ThemeToggle from "../../components/common/ThemeToggle";


function BusinessLogin() {

    const navigate = useNavigate();

    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ============================================================
    // NORMAL LOGIN
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        if (!mobileNumber || !password) {
            setError(
                "Please enter mobile number and password"
            );
            return;
        }

        try {

            setLoading(true);

            const data = await loginBusiness(
                mobileNumber,
                password
            );

            saveAuth(
                data.token,
                data.business,
                "business"
            );


            // Get latest profile
            const profileResponse = await api.get(
                "/business/profile",
                {
                    headers: {
                        Authorization:
                            `Bearer ${data.token}`
                    }
                }
            );

            const business =
                profileResponse.data.business;

            localStorage.setItem(
                "user",
                JSON.stringify(business)
            );


            if (
                business.profileComplete === false
            ) {

                navigate(
                    "/business/complete-profile",
                    { replace: true }
                );

            } else {

                navigate(
                    "/business/dashboard",
                    { replace: true }
                );
            }


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // GOOGLE LOGIN
    // ============================================================

    const handleGoogleCredential = async (response) => {

        try {

            setError("");
            setLoading(true);

            const data =
                await googleBusinessLogin(
                    response.credential
                );


            saveAuth(
                data.token,
                data.business,
                "business"
            );


            const profileResponse =
                await api.get(
                    "/business/profile",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${data.token}`
                        }
                    }
                );


            const business =
                profileResponse.data.business;


            localStorage.setItem(
                "user",
                JSON.stringify(business)
            );


            if (
                business.profileComplete === false
            ) {

                navigate(
                    "/business/complete-profile",
                    { replace: true }
                );

            } else {

                navigate(
                    "/business/dashboard",
                    { replace: true }
                );
            }


        } catch (error) {

            console.error(
                "Google Business Login Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Google authentication failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="auth-page">

            <div className="auth-theme-toggle">
                <ThemeToggle />
            </div>

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Business Login
                    </h1>

                    <p>
                        Manage your fleet, drivers,
                        shifts and payments.
                    </p>

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Mobile Number
                        </label>

                        <input
                            type="tel"
                            placeholder="Enter mobile number"
                            value={mobileNumber}
                            onChange={(e) =>
                                setMobileNumber(
                                    e.target.value
                                )
                            }
                            autoComplete="tel"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                            >
                                {showPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    <div className="forgot-password">

                        <Link to="/forgot-password?role=business">
                            Forgot Password?
                        </Link>

                    </div>


                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                <div className="auth-divider">
                    <span>OR</span>
                </div>


                <GoogleButton
                    onCredential={
                        handleGoogleCredential
                    }
                />


                <p className="register-link">

                    Don't have a business account?

                    {" "}

                    <Link to="/business/register">
                        Create account
                    </Link>

                </p>


                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
}


export default BusinessLogin;