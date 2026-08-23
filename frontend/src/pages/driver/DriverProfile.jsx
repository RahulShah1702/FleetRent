import { useEffect, useState } from "react";
import api from "../../services/api";
import "./DriverProfile.css";
import { useNavigate } from "react-router-dom";


function DriverProfile() {

    const [profile, setProfile] = useState(null);

    const [editing, setEditing] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        drivingLicenseNumber: "",
        address: ""
    });


    // ============================================================
    // LOAD PROFILE
    // ============================================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const response =
                    await api.get(
                        "/driver/profile"
                    );

                const driver =
                    response.data.driver;

                setProfile(driver);

                setFormData({
                    fullName:
                        driver.fullName || "",

                    mobileNumber:
                        driver.mobileNumber || "",

                    drivingLicenseNumber:
                        driver.drivingLicenseNumber || "",

                    address:
                        driver.address || ""
                });

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load profile."
                );

            } finally {

                setLoading(false);
            }
        };

        loadProfile();

    }, []);


    // ============================================================
    // HANDLE INPUT
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };


    // ============================================================
    // SAVE PROFILE
    // ============================================================

    const handleSave = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (
            !formData.fullName.trim() ||
            !formData.mobileNumber.trim() ||
            !formData.drivingLicenseNumber.trim() ||
            !formData.address.trim()
        ) {
            setError(
                "Please fill all required fields."
            );

            return;
        }


        try {

            setSaving(true);

            const response =
                await api.put(
                    "/driver/profile",
                    {
                        fullName:
                            formData.fullName,

                        mobileNumber:
                            formData.mobileNumber,

                        drivingLicenseNumber:
                            formData.drivingLicenseNumber,

                        address:
                            formData.address
                    }
                );


            const updatedDriver =
                response.data.driver;


            setProfile(updatedDriver);


            setFormData({
                fullName:
                    updatedDriver.fullName,

                mobileNumber:
                    updatedDriver.mobileNumber,

                drivingLicenseNumber:
                    updatedDriver.drivingLicenseNumber,

                address:
                    updatedDriver.address
            });


            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedDriver
                )
            );


            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // CANCEL EDIT
    // ============================================================

    const handleCancel = () => {

        setEditing(false);

        setError("");
        setSuccess("");

        setFormData({
            fullName:
                profile.fullName || "",

            mobileNumber:
                profile.mobileNumber || "",

            drivingLicenseNumber:
                profile.drivingLicenseNumber || "",

            address:
                profile.address || ""
        });
    };
    const navigate = useNavigate();

    if (loading) {

        return (
            <div className="profile-page">

                <div className="profile-loading">
                    Loading profile...
                </div>

            </div>
        );
    }


    if (!profile) {

        return (
            <div className="profile-page">

                <div className="profile-card">

                    <div className="error-message">
                        {error || "Profile not found."}
                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="profile-page">

            <div className="profile-card">

                {/* HEADER */}

                <div className="profile-header">

                    <div>

                        <h1>
                            Personal Profile
                        </h1>

                        <p>
                            Manage your driver information.
                        </p>

                    </div>


                    {!editing && (

                        <button
                            type="button"
                            className="edit-profile-button"
                            onClick={() => {
                                setEditing(true);
                                setSuccess("");
                                setError("");
                            }}
                        >
                            Edit Profile
                        </button>

                    )}

                </div>


                {/* MESSAGES */}

                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}


                {success && (
                    <div className="profile-success">
                        {success}
                    </div>
                )}


                <form
                    className="profile-form"
                    onSubmit={handleSave}
                >

                    {/* FULL NAME */}

                    <div className="profile-field">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={
                                formData.fullName
                            }
                            onChange={
                                handleChange
                            }
                            disabled={!editing}
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="profile-field">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={
                                profile.email || ""
                            }
                            disabled
                        />

                        <small>
                            Email cannot be changed
                            from this page.
                        </small>

                    </div>


                    {/* MOBILE */}

                    <div className="profile-field">

                        <label>
                            Mobile Number
                        </label>

                        <input
                            type="tel"
                            name="mobileNumber"
                            value={
                                formData.mobileNumber
                            }
                            onChange={
                                handleChange
                            }
                            disabled={!editing}
                        />

                    </div>


                    {/* LICENSE */}

                    <div className="profile-field">

                        <label>
                            Driving License Number
                        </label>

                        <input
                            type="text"
                            name="drivingLicenseNumber"
                            value={
                                formData.drivingLicenseNumber
                            }
                            onChange={
                                handleChange
                            }
                            disabled={!editing}
                        />

                    </div>


                    {/* ADDRESS */}

                    <div className="profile-field">

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            rows="4"
                            value={
                                formData.address
                            }
                            onChange={
                                handleChange
                            }
                            disabled={!editing}
                        />

                    </div>


                    {/* ACTIONS */}

                    {editing && (

                        <div className="profile-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={
                                    handleCancel
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    )}

                </form>

                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() =>
                        navigate("/driver/dashboard")
                    }
                >
                    ← Back
                </button>

            </div>

        </div>
    );
}


export default DriverProfile;