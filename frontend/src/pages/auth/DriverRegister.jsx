import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerDriver } from "../../services/authService";
import { saveAuth } from "../../utils/auth";
import api from "../../services/api";
import GoogleButton
    from "../../components/common/GoogleButton";

import ThemeToggle
    from "../../components/common/ThemeToggle";

import {
    googleDriverLogin
} from "../../services/authService";


function DriverRegister() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        drivingLicenseNumber: "",
        address: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");


        // Client-side validation
        if (
            !formData.fullName ||
            !formData.mobileNumber ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.drivingLicenseNumber ||
            !formData.address
        ) {
            setError("Please fill all required fields.");
            return;
        }


        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }


        try {

            setLoading(true);

            const data = await registerDriver(formData);


            // Save login session returned by backend
            saveAuth(
                data.token,
                data.driver,
                "driver"
            );


            // Get latest profile status
            const profileResponse = await api.get(
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


            // New drivers normally need
            // to complete their profile.
            if (driver.profileComplete === false) {

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

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
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
            "Google Driver Registration Error:",
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

            <div className="auth-card register-card">

                <div className="auth-header">

                    <h1>Create Driver Account</h1>

                    <p>
                        Enter your details to create
                        your FleetRent account.
                    </p>

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    {/* FULL NAME */}

                    <div className="form-group">

                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                        />

                    </div>


                    {/* MOBILE */}

                    <div className="form-group">

                        <label htmlFor="mobileNumber">
                            Mobile Number
                        </label>

                        <input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            placeholder="Enter mobile number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            autoComplete="tel"
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                    </div>


                    {/* LICENSE */}

                    <div className="form-group">

                        <label htmlFor="drivingLicenseNumber">
                            Driving License Number
                        </label>

                        <input
                            id="drivingLicenseNumber"
                            name="drivingLicenseNumber"
                            type="text"
                            placeholder="Enter license number"
                            value={
                                formData.drivingLicenseNumber
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* ADDRESS */}

                    <div className="form-group">

                        <label htmlFor="address">
                            Address
                        </label>

                        <textarea
                            id="address"
                            name="address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (prev) => !prev
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Driver Account"}
                    </button>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <GoogleButton
                        onCredential={
                            handleGoogleCredential
                        }
                    />

                </form>


                <p className="register-link">

                    Already have an account?

                    {" "}

                    <Link to="/driver/login">
                        Sign in
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


export default DriverRegister;