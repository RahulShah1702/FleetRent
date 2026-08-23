import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./BusinessProfile.css";

import api from "../../services/api";


function BusinessProfile() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        businessName: "",
        fleetSize: "",
        city: "",
        state: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);


    // ============================================================
    // GET PROFILE
    // ============================================================

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const response =
                    await api.get(
                        "/business/profile"
                    );

                const business =
                    response.data.business;

                setProfile(business);

                setFormData({
                    fullName:
                        business.fullName || "",

                    mobileNumber:
                        business.mobileNumber || "",

                    businessName:
                        business.businessName || "",

                    fleetSize:
                        business.fleetSize ?? "",

                    city:
                        business.city || "",

                    state:
                        business.state || ""
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


        fetchProfile();

    }, []);


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


    // ============================================================
    // UPDATE PROFILE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setSaving(true);

            const response =
                await api.put(
                    "/business/profile",
                    {
                        ...formData,
                        fleetSize:
                            Number(
                                formData.fleetSize
                            )
                    }
                );

            const updatedBusiness =
                response.data.business;

            setProfile(updatedBusiness);

            setFormData({
                fullName:
                    updatedBusiness.fullName,

                mobileNumber:
                    updatedBusiness.mobileNumber,

                businessName:
                    updatedBusiness.businessName,

                fleetSize:
                    updatedBusiness.fleetSize,

                city:
                    updatedBusiness.city,

                state:
                    updatedBusiness.state
            });

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedBusiness
                )
            );

            setEditing(false);

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


    const handleCancel = () => {

        setEditing(false);

        setError("");

        setFormData({
            fullName:
                profile.fullName,

            mobileNumber:
                profile.mobileNumber,

            businessName:
                profile.businessName,

            fleetSize:
                profile.fleetSize,

            city:
                profile.city,

            state:
                profile.state
        });
    };


    if (loading) {
        return (
            <div className="profile-page">
                <p>Loading profile...</p>
            </div>
        );
    }


    if (!profile) {
        return (
            <div className="profile-page">
                <p>{error || "Profile not found."}</p>
            </div>
        );
    }


    return (

        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-header">

                    <div>
                        <h1>
                            Personal Profile
                        </h1>

                        <p>
                            Manage your business information.
                        </p>
                    </div>


                    {!editing && (
                        <button
                            className="edit-profile-button"
                            onClick={() =>
                                setEditing(true)
                            }
                        >
                            Edit Profile
                        </button>
                    )}

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <div className="profile-form">

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            name="fullName"
                            value={
                                formData.fullName
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={
                                profile.email
                            }
                            disabled
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Mobile Number
                        </label>

                        <input
                            name="mobileNumber"
                            type="tel"
                            value={
                                formData.mobileNumber
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Business Name
                        </label>

                        <input
                            name="businessName"
                            value={
                                formData.businessName
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Fleet Size
                        </label>

                        <input
                            name="fleetSize"
                            type="number"
                            min="0"
                            value={
                                formData.fleetSize
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            City
                        </label>

                        <input
                            name="city"
                            value={
                                formData.city
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            State
                        </label>

                        <input
                            name="state"
                            value={
                                formData.state
                            }
                            onChange={handleChange}
                            disabled={!editing}
                        />

                    </div>


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
                                type="button"
                                className="save-button"
                                onClick={
                                    handleSubmit
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    )}

                </div>

                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>

        </div>
    );
}


export default BusinessProfile;