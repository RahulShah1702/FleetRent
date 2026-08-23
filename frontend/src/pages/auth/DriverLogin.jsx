import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    loginDriver,
    googleDriverLogin
} from "../../services/authService";

import {
    saveAuth
} from "../../utils/auth";

import api from "../../services/api";

import GoogleButton
    from "../../components/common/GoogleButton";

import ThemeToggle
    from "../../components/common/ThemeToggle";


function DriverLogin() {

    const navigate = useNavigate();


    const [mobileNumber, setMobileNumber] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        // ====================================================
        // 1. Check fields
        // ====================================================

        if (!mobileNumber || !password) {

            setError(
                "Please enter mobile number and password"
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // 2. Login
            // =================================================

            const data =
                await loginDriver(
                    mobileNumber,
                    password
                );


            // =================================================
            // 3. Save authentication
            // =================================================

            saveAuth(
                data.token,
                data.driver,
                "driver"
            );


            // =================================================
            // 4. Check profile completion
            // =================================================

            const profileResponse =
                await api.get(
                    "/driver/profile",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${data.token}`
                        }
                    }
                );


            const driver =
                profileResponse.data.driver;


            // =================================================
            // 5. Update stored user information
            // =================================================

            localStorage.setItem(
                "user",
                JSON.stringify(driver)
            );


            // =================================================
            // 6. Redirect according to profile status
            // =================================================

            if (
                driver.profileComplete === false
            ) {

                navigate(
                    "/driver/complete-profile",
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    "/driver/dashboard",
                    {
                        replace: true
                    }
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
    
        const handleGoogleCredential = async (response) => {
        
        try {
        
            setError("");
            setLoading(true);
        
        
            const data =
                await googleDriverLogin(
                    response.credential
                );
            
            
            saveAuth(
                data.token,
                data.driver,
                "driver"
            );
        
        
            // Get latest profile information
            const profileResponse =
                await api.get(
                    "/driver/profile",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${data.token}`
                        }
                    }
                );
            
            
            const driver =
                profileResponse.data.driver;
            
            
            localStorage.setItem(
                "user",
                JSON.stringify(driver)
            );
        
        
            if (
                driver.profileComplete === false
            ) {
            
                navigate(
                    "/driver/complete-profile",
                    { replace: true }
                );
            
            } else {
            
                navigate(
                    "/driver/dashboard",
                    { replace: true }
                );
            }
        
        
        } catch (error) {
        
            console.error(
                "Google Driver Login Error:",
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

                <h1>
                    Driver Login
                </h1>


                <p className="auth-subtitle">
                    Login to manage your vehicle,
                    shifts and payments.
                </p>


                {/* ERROR */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                >

                    {/* MOBILE NUMBER */}

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
                        />

                    </div>


                    {/* PASSWORD */}

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
                            />


                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword
                                    ? "🙈"
                                    : "👁️"
                                }
                            </button>

                        </div>

                    </div>


                    {/* FORGOT PASSWORD */}

                    <div className="forgot-password">

                        <Link to="/forgot-password?role=driver">
                            Forgot Password?
                        </Link>

                    </div>


                    {/* LOGIN */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* DIVIDER */}

                <div className="auth-divider">
                    <span>OR</span>
                </div>


                {/* GOOGLE */}

                <GoogleButton
                    onCredential={
                        handleGoogleCredential
                    }
                />


                {/* REGISTER */}

                <p className="register-link">

                    Don't have an account?

                    {" "}

                    <Link to="/driver/register">
                        Register as Driver
                    </Link>

                </p>


                {/* BACK */}

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
}


export default DriverLogin;