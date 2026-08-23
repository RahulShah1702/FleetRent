import api from "./api";


// ============================================================
// DRIVER LOGIN
// ============================================================

export const loginDriver = async (mobileNumber, password) => {

    const response = await api.post(
        "/drivers/login",
        {
            mobileNumber,
            password
        }
    );

    return response.data;
};


// ============================================================
// DRIVER REGISTER
// ============================================================

export const registerDriver = async (data) => {

    const response = await api.post(
        "/drivers/register",
        data
    );

    return response.data;
};


// ============================================================
// BUSINESS LOGIN
// ============================================================

export const loginBusiness = async (
    mobileNumber,
    password
) => {

    const response = await api.post(
        "/business/login",
        {
            mobileNumber,
            password
        }
    );

    return response.data;
};


// ============================================================
// BUSINESS REGISTER
// ============================================================

export const registerBusiness = async (data) => {

    const response = await api.post(
        "/business/register",
        data
    );

    return response.data;
};



// ============================================================
// GOOGLE DRIVER
// ============================================================

export const googleDriverLogin = async (
    credential
) => {

    const response = await api.post(
        "/auth/google/driver",
        {
            credential
        }
    );

    return response.data;
};


// ============================================================
// GOOGLE BUSINESS
// ============================================================

export const googleBusinessLogin = async (
    credential
) => {

    const response = await api.post(
        "/auth/google/business",
        {
            credential
        }
    );

    return response.data;
};

// ============================================================
// PASSWORD RESET - REQUEST OTP
// ============================================================

export const requestPasswordResetOtp = async ({
    email,
    role
}) => {

    const response =
        await api.post(
            "/auth/password-reset/request-otp",
            {
                email,
                role
            }
        );

    return response.data;
};


// ============================================================
// PASSWORD RESET - VERIFY OTP
// ============================================================

export const verifyPasswordResetOtp = async ({
    email,
    role,
    otp
}) => {

    const response =
        await api.post(
            "/auth/password-reset/verify-otp",
            {
                email,
                role,
                otp
            }
        );

    return response.data;
};



// ============================================================
// PASSWORD RESET - RESET PASSWORD
// ============================================================

export const resetPassword = async ({
    role,
    resetToken,
    password,
    confirmPassword
}) => {

    const response =
        await api.post(
            "/auth/password-reset/reset-password",
            {
                role,
                resetToken,
                password,
                confirmPassword
            }
        );

    return response.data;
};








