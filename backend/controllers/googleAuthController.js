const { OAuth2Client } = require("google-auth-library");

const Driver = require("../models/Driver");
const Business = require("../models/Business");
const generateToken = require("../utils/generateToken");


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// ============================================================
// VERIFY GOOGLE CREDENTIAL
// ============================================================

const verifyGoogleCredential = async (credential) => {

    if (!credential) {
        throw new Error("Google credential is required");
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new Error("Invalid Google credential");
    }

    const {
        sub: googleId,
        email,
        name,
        email_verified
    } = payload;

    if (!email || !email_verified) {
        throw new Error(
            "Google email is not verified"
        );
    }

    return {
        googleId,
        email: email.toLowerCase(),
        name: name || ""
    };
};


// ============================================================
// GOOGLE DRIVER LOGIN / REGISTRATION
// ============================================================

const googleDriverLogin = async (req, res) => {

    try {

        const {
            credential
        } = req.body;


        // ====================================================
        // 1. Verify Google account
        // ====================================================

        const {
            googleId,
            email,
            name
        } = await verifyGoogleCredential(
            credential
        );


        // ====================================================
        // 2. Check whether this Google account
        //    already belongs to a Business
        // ====================================================

        const existingBusiness =
            await Business.findOne({
                googleId
            });

        if (existingBusiness) {

            return res.status(400).json({
                message:
                    "This Google account is already linked to a business account. Please continue as Business."
            });
        }


        // ====================================================
        // 3. Find Driver by Google ID
        // ====================================================

        let driver =
            await Driver.findOne({
                googleId
            });


        // ====================================================
        // 4. If Google ID not found,
        //    check existing Driver by email
        // ====================================================

        if (!driver) {

            driver =
                await Driver.findOne({
                    email
                });


            // =================================================
            // Existing password Driver
            // =================================================

            if (driver) {

                // Link Google account
                driver.googleId = googleId;

                await driver.save();

            }


            // =================================================
            // New Google Driver
            // =================================================

            else {

                driver =
                    await Driver.create({

                        fullName:
                            name ||
                            "Google Driver",

                        email,

                        googleId,

                        profileComplete: false
                    });
            }
        }


        // ====================================================
        // 5. Generate FleetRent JWT
        // ====================================================

        const token =
            generateToken(
                driver._id,
                "driver"
            );


        // ====================================================
        // 6. Send response
        // ====================================================

        return res.status(200).json({

            message:
                "Google driver login successful",

            token,

            driver: {

                id:
                    driver._id,

                fullName:
                    driver.fullName,

                email:
                    driver.email,

                mobileNumber:
                    driver.mobileNumber ||
                    null,

                profileComplete:
                    driver.profileComplete
            }
        });


    } catch (error) {

        console.error(
            "Google Driver Login Error:",
            error
        );


        // Duplicate key error
        if (error.code === 11000) {

            return res.status(400).json({

                message:
                    "This Google account or email is already associated with another account."
            });
        }


        return res.status(401).json({

            message:
                error.message ||
                "Google authentication failed"
        });
    }
};


// ============================================================
// GOOGLE BUSINESS LOGIN / REGISTRATION
// ============================================================

const googleBusinessLogin = async (req, res) => {

    try {

        const {
            credential
        } = req.body;


        // ====================================================
        // 1. Verify Google account
        // ====================================================

        const {
            googleId,
            email,
            name
        } = await verifyGoogleCredential(
            credential
        );


        // ====================================================
        // 2. Check whether this Google account
        //    already belongs to a Driver
        // ====================================================

        const existingDriver =
            await Driver.findOne({
                googleId
            });

        if (existingDriver) {

            return res.status(400).json({

                message:
                    "This Google account is already linked to a driver account. Please continue as Driver."
            });
        }


        // ====================================================
        // 3. Find Business by Google ID
        // ====================================================

        let business =
            await Business.findOne({
                googleId
            });


        // ====================================================
        // 4. If Google ID not found,
        //    check existing Business by email
        // ====================================================

        if (!business) {

            business =
                await Business.findOne({
                    email
                });


            // =================================================
            // Existing password Business
            // =================================================

            if (business) {

                // Link Google account
                business.googleId =
                    googleId;

                await business.save();

            }


            // =================================================
            // New Google Business
            // =================================================

            else {

                business =
                    await Business.create({

                        fullName:
                            name ||
                            "Google User",

                        email,

                        googleId,

                        profileComplete:
                            false
                    });
            }
        }


        // ====================================================
        // 5. Generate FleetRent JWT
        // ====================================================

        const token =
            generateToken(
                business._id,
                "business"
            );


        // ====================================================
        // 6. Send response
        // ====================================================

        return res.status(200).json({

            message:
                "Google business login successful",

            token,

            business: {

                id:
                    business._id,

                fullName:
                    business.fullName,

                businessName:
                    business.businessName ||
                    null,

                email:
                    business.email,

                mobileNumber:
                    business.mobileNumber ||
                    null,

                profileComplete:
                    business.profileComplete
            }
        });


    } catch (error) {

        console.error(
            "Google Business Login Error:",
            error
        );


        // Duplicate key error
        if (error.code === 11000) {

            return res.status(400).json({

                message:
                    "This Google account or email is already associated with another account."
            });
        }


        return res.status(401).json({

            message:
                error.message ||
                "Google authentication failed"
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    googleDriverLogin,

    googleBusinessLogin

};