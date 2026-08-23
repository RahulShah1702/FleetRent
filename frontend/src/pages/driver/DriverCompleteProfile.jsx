import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { getUser } from "../../utils/auth";


function DriverCompleteProfile() {

    const navigate = useNavigate();

    const user = getUser();


    const [formData, setFormData] = useState({
        mobileNumber:
            user?.mobileNumber || "",

        drivingLicenseNumber:
            user?.drivingLicenseNumber || "",

        address:
            user?.address || ""
    });


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (
            !formData.mobileNumber ||
            !formData.drivingLicenseNumber ||
            !formData.address
        ) {

            setError(
                "Please complete all required fields."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await api.put(
                    "/driver/profile/complete",
                    {
                        mobileNumber:
                            formData.mobileNumber,

                        drivingLicenseNumber:
                            formData.drivingLicenseNumber,

                        address:
                            formData.address
                    }
                );


            const driver =
                response.data.driver;


            // Update stored user
            localStorage.setItem(
                "user",
                JSON.stringify(driver)
            );


            navigate(
                "/driver/dashboard",
                {
                    replace: true
                }
            );


        } catch (error) {

            console.error(
                "Driver profile error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to complete profile."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card register-card">

                <div className="auth-header">

                    <h1>
                        Complete Your Profile
                    </h1>

                    <p>
                        Add your driver details
                        to continue to FleetRent.
                    </p>

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form
                    onSubmit={handleSubmit}
                >

                    {/* FULL NAME */}

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={
                                user?.fullName || ""
                            }
                            disabled
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={
                                user?.email || ""
                            }
                            disabled
                        />

                    </div>


                    {/* MOBILE */}

                    <div className="form-group">

                        <label>
                            Mobile Number
                        </label>

                        <input
                            type="tel"
                            name="mobileNumber"
                            placeholder="Enter mobile number"
                            value={
                                formData.mobileNumber
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* LICENSE */}

                    <div className="form-group">

                        <label>
                            Driving License Number
                        </label>

                        <input
                            type="text"
                            name="drivingLicenseNumber"
                            placeholder="Enter driving license number"
                            value={
                                formData.drivingLicenseNumber
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* ADDRESS */}

                    <div className="form-group">

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            placeholder="Enter your address"
                            value={
                                formData.address
                            }
                            onChange={handleChange}
                            rows="4"
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Complete Profile"}
                    </button>

                </form>

            </div>

        </div>
    );
}


export default DriverCompleteProfile;