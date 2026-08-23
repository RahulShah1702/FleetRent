import {
    useMemo,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword
} from "../../services/authService";

import "./ForgotPassword.css";

import ThemeToggle
    from "../../components/common/ThemeToggle";


function ForgotPassword() {

    const navigate =
        useNavigate();

    const [searchParams] =
        useSearchParams();


    const queryRole =
        searchParams.get("role");


    const initialRole =
        queryRole === "driver" ||
        queryRole === "business"
            ? queryRole
            : "";


    const [role, setRole] =
        useState(initialRole);

    const [step, setStep] =
        useState(
            initialRole
                ? "email"
                : "role"
        );

    const [email, setEmail] =
        useState("");

    const [otp, setOtp] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [resetToken, setResetToken] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    const roleLabel =
        useMemo(
            () =>
                role === "business"
                    ? "Business"
                    : "Driver",
            [role]
        );


    // ============================================================
    // SELECT ROLE
    // ============================================================

    const handleRoleSelect = (
        selectedRole
    ) => {

        setRole(selectedRole);
        setStep("email");
        setError("");
        setMessage("");

    };


    // ============================================================
    // SEND OTP
    // ============================================================

    const handleSendOtp = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(normalizedEmail)) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        try {

            setLoading(true);


            await requestPasswordResetOtp({
                email:
                    normalizedEmail,
                role
            });


            setEmail(
                normalizedEmail
            );

            setStep("otp");

            setMessage(
                "OTP sent successfully. It is valid for 5 minutes."
            );

        } catch (error) {

            console.error(
                "Send OTP Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // VERIFY OTP
    // ============================================================

    const handleVerifyOtp = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const cleanOtp =
            otp.replace(/\D/g, "");


        if (
            cleanOtp.length !== 6
        ) {

            setError(
                "Please enter the 6-digit OTP."
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                await verifyPasswordResetOtp({
                    email,
                    role,
                    otp: cleanOtp
                });


            setResetToken(
                data.resetToken
            );

            setStep("password");

            setOtp("");

            setMessage("");

        } catch (error) {

            console.error(
                "Verify OTP Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Invalid or expired OTP."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // RESET PASSWORD
    // ============================================================

    const handleResetPassword = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setMessage("");


        if (
            password.length < 6
        ) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);


            await resetPassword({
                role,
                resetToken,
                password,
                confirmPassword
            });


            setStep("success");

            setPassword("");
            setConfirmPassword("");
            setResetToken("");

        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to reset password. Please start again."
            );

        } finally {

            setLoading(false);

        }

    };


    const handleStartAgain = () => {

        setStep("email");
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        setError("");
        setMessage("");

    };


    const handleBackToLogin = () => {

        navigate(
            role === "business"
                ? "/business/login"
                : "/driver/login"
        );

    };


    return (

        <div className="password-reset-page">

            <div className="password-reset-theme-toggle">
                <ThemeToggle />
            </div>

            <div className="password-reset-card">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="password-reset-header">

                    <p className="password-reset-eyebrow">
                        FLEETRENT
                    </p>

                    <h1>
                        Forgot Password
                    </h1>

                    <p>
                        Reset your FleetRent account password using an email OTP.
                    </p>

                </div>


                {/* =================================================
                    ROLE SELECTOR
                ================================================== */}

                {step === "role" && (

                    <div className="password-reset-role-step">

                        <h2>
                            Choose account type
                        </h2>

                        <p>
                            Select the account whose password you want to reset.
                        </p>

                        <div className="password-reset-role-grid">

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleSelect(
                                        "driver"
                                    )
                                }
                            >
                                <strong>
                                    Driver
                                </strong>

                                <span>
                                    Driver account
                                </span>
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleSelect(
                                        "business"
                                    )
                                }
                            >
                                <strong>
                                    Business
                                </strong>

                                <span>
                                    Business account
                                </span>
                            </button>

                        </div>

                    </div>

                )}


                {/* =================================================
                    EMAIL
                ================================================== */}

                {step === "email" && (

                    <form
                        onSubmit={
                            handleSendOtp
                        }
                    >

                        <div className="password-reset-account-pill">
                            Resetting: <strong>{roleLabel}</strong>
                        </div>


                        <div className="password-reset-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                
                                
                                placeholder="Enter email address"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                autoComplete="email"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="password-reset-primary-button"
                            disabled={loading}
                        >
                            {
                                loading
                                    ? "Sending OTP..."
                                    : "Send OTP"
                            }
                        </button>


                        <button
                            type="button"
                            className="password-reset-secondary-button"
                            onClick={() => {
                                if (queryRole) {
                                    handleBackToLogin();
                                } else {
                                    setStep("role");
                                }
                            }}
                        >
                            ← Back
                        </button>

                    </form>

                )}


                {/* =================================================
                    OTP
                ================================================== */}

                {step === "otp" && (

                    <form
                        onSubmit={
                            handleVerifyOtp
                        }
                    >

                        <div className="password-reset-account-pill">
                            OTP sent to <strong>{email}</strong>
                        </div>


                        <div className="password-reset-field">

                            <label>
                                Enter OTP
                            </label>

                            <input
                                type="text"
                                
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(event) =>
                                    setOtp(
                                        event.target.value
                                    )
                                }
                                autoComplete="one-time-code"
                                required
                            />

                        </div>


                        <p className="password-reset-helper">
                            OTP expires in 5 minutes.
                            The OTP will be sent to your registered email address. Please check your spam for otp
                        </p>


                        <button
                            type="submit"
                            className="password-reset-primary-button"
                            disabled={loading}
                        >
                            {
                                loading
                                    ? "Verifying..."
                                    : "Verify OTP"
                            }
                        </button>


                        <button
                            type="button"
                            className="password-reset-secondary-button"
                            onClick={() => {
                                setStep("email");
                                setOtp("");
                                setError("");
                                setMessage("");
                            }}
                        >
                            ← Change Email Address
                        </button>

                    </form>

                )}


                {/* =================================================
                    PASSWORD
                ================================================== */}

                {step === "password" && (

                    <form
                        onSubmit={
                            handleResetPassword
                        }
                    >

                        <div className="password-reset-account-pill">
                            Resetting: <strong>{roleLabel}</strong>
                        </div>


                        <div className="password-reset-field">

                            <label>
                                New Password
                            </label>

                            <div className="password-reset-password-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            current =>
                                                !current
                                        )
                                    }
                                >
                                    {
                                        showPassword
                                            ? "🙈"
                                            : "👁️"
                                    }
                                </button>

                            </div>

                        </div>


                        <div className="password-reset-field">

                            <label>
                                Confirm Password
                            </label>

                            <div className="password-reset-password-wrapper">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            current =>
                                                !current
                                        )
                                    }
                                >
                                    {
                                        showConfirmPassword
                                            ? "🙈"
                                            : "👁️"
                                    }
                                </button>

                            </div>

                        </div>


                        <p className="password-reset-helper">
                            Password must contain at least 6 characters.
                        </p>


                        <button
                            type="submit"
                            className="password-reset-primary-button"
                            disabled={loading}
                        >
                            {
                                loading
                                    ? "Updating Password..."
                                    : "Reset Password"
                            }
                        </button>

                    </form>

                )}


                {/* =================================================
                    SUCCESS
                ================================================== */}

                {step === "success" && (

                    <div className="password-reset-success">

                        <div className="password-reset-success-icon">
                            ✓
                        </div>

                        <h2>
                            Password Updated
                        </h2>

                        <p>
                            Your {roleLabel.toLowerCase()} password has been reset successfully.
                        </p>

                        <button
                            type="button"
                            className="password-reset-primary-button"
                            onClick={
                                handleBackToLogin
                            }
                        >
                            Back to {roleLabel} Login
                        </button>

                    </div>

                )}


                {/* =================================================
                    ALERTS
                ================================================== */}

                {message && (
                    <div className="password-reset-success-message">
                        {message}
                    </div>
                )}


                {error && (
                    <div className="password-reset-error-message">
                        {error}
                    </div>
                )}


                {/* =================================================
                    FOOTER LINKS
                ================================================== */}

                {step !== "success" && (

                    <div className="password-reset-footer-links">

                        <button
                            type="button"
                            onClick={handleBackToLogin}
                        >
                            ← Back to Login
                        </button>


                        {!queryRole && (
                            <Link to="/">
                                Back to Home
                            </Link>
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default ForgotPassword;
