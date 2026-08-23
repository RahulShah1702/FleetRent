import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { getUser } from "../../utils/auth";


function BusinessCompleteProfile() {

    const navigate = useNavigate();

    const user = getUser();


    const [formData, setFormData] = useState({
        mobileNumber: user?.mobileNumber || "",
        businessName: user?.businessName || "",
        fleetSize: user?.fleetSize ?? "",
        city: user?.city || "",
        state: user?.state || ""
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
            !formData.businessName ||
            formData.fleetSize === "" ||
            !formData.city ||
            !formData.state
        ) {

            setError(
                "Please complete all required fields."
            );

            return;
        }


        if (
            Number(formData.fleetSize) < 0
        ) {

            setError(
                "Fleet size cannot be negative."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await api.put(
                    "/business/profile/complete",
                    {
                        mobileNumber:
                            formData.mobileNumber,

                        businessName:
                            formData.businessName,

                        fleetSize:
                            Number(
                                formData.fleetSize
                            ),

                        city:
                            formData.city,

                        state:
                            formData.state
                    }
                );


            const business =
                response.data.business;


            // Update local user
            localStorage.setItem(
                "user",
                JSON.stringify(business)
            );


            // Profile is now complete
            navigate(
                "/business/dashboard",
                {
                    replace: true
                }
            );


        } catch (error) {

            console.error(
                "Business profile error:",
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
                        Add your business details
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

                    {/* NAME */}

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


                    {/* BUSINESS NAME */}

                    <div className="form-group">

                        <label>
                            Business Name
                        </label>

                        <input
                            type="text"
                            name="businessName"
                            placeholder="Enter business name"
                            value={
                                formData.businessName
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* FLEET SIZE */}

                    <div className="form-group">

                        <label>
                            Fleet Size
                        </label>

                        <input
                            type="number"
                            name="fleetSize"
                            min="0"
                            placeholder="Number of vehicles"
                            value={
                                formData.fleetSize
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* CITY */}

                    <div className="form-group">

                        <label>
                            City
                        </label>

                        <input
                            type="text"
                            name="city"
                            placeholder="Enter city"
                            value={
                                formData.city
                            }
                            onChange={handleChange}
                        />

                    </div>


                    {/* STATE */}

                    <div className="form-group">

                        <label>
                            State
                        </label>

                        <input
                            type="text"
                            name="state"
                            placeholder="Enter state"
                            value={
                                formData.state
                            }
                            onChange={handleChange}
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


export default BusinessCompleteProfile;