import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    registerBusiness,
    googleBusinessLogin
} from "../../services/authService";

import { saveAuth } from "../../utils/auth";
import api from "../../services/api";
import GoogleButton from "../../components/common/GoogleButton";
import ThemeToggle from "../../components/common/ThemeToggle";


function BusinessRegister() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
        fleetSize: "",
        city: "",
        state: ""
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


    // ============================================================
    // NORMAL REGISTRATION
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        const {
            fullName,
            mobileNumber,
            email,
            password,
            confirmPassword,
            businessName,
            fleetSize,
            city,
            state
        } = formData;


        if (
            !fullName ||
            !mobileNumber ||
            !email ||
            !password ||
            !confirmPassword ||
            !businessName ||
            fleetSize === "" ||
            !city ||
            !state
        ) {

            setError(
                "Please fill all required fields."
            );

            return;
        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (Number(fleetSize) < 0) {

            setError(
                "Fleet size cannot be negative."
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                await registerBusiness({
                    ...formData,
                    fleetSize:
                        Number(formData.fleetSize)
                });


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

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // GOOGLE REGISTRATION / LOGIN
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

            console.error(error);

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

                    <h1>
                        Create Business Account
                    </h1>

                    <p>
                        Set up your FleetRent
                        business account.
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

                        <label>
                            Full Name
                        </label>

                        <input
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                        />

                    </div>


                    {/* BUSINESS NAME */}

                    <div className="form-group">

                        <label>
                            Business Name
                        </label>

                        <input
                            name="businessName"
                            type="text"
                            placeholder="Enter business name"
                            value={formData.businessName}
                            onChange={handleChange}
                        />

                    </div>


                    {/* MOBILE */}

                    <div className="form-group">

                        <label>
                            Mobile Number
                        </label>

                        <input
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

                        <label>
                            Email Address
                        </label>

                        <input
                            name="email"
                            type="email"
                            placeholder="Enter business email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                    </div>


                    {/* FLEET SIZE */}

                    <div className="form-group">

                        <label>
                            Fleet Size
                        </label>

                        <input
                            name="fleetSize"
                            type="number"
                            min="0"
                            placeholder="Number of vehicles"
                            value={formData.fleetSize}
                            onChange={handleChange}
                        />

                    </div>


                    {/* CITY */}

                    <div className="form-group">

                        <label>
                            City
                        </label>

                        <input
                            name="city"
                            type="text"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={handleChange}
                        />

                    </div>


                    {/* STATE */}

                    <div className="form-group">

                        <label>
                            State
                        </label>

                        <input
                            name="state"
                            type="text"
                            placeholder="Enter state"
                            value={formData.state}
                            onChange={handleChange}
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
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
                            >
                                {showPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <div className="password-input-wrapper">

                            <input
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm password"
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
                            >
                                {showConfirmPassword
                                    ? "🙈"
                                    : "👁️"}
                            </button>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Business Account"}
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

                    Already have an account?

                    {" "}

                    <Link to="/business/login">
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


export default BusinessRegister;