 const sendEmailOtp = async ({
    email,
    role,
    otp
}) => {

    const apiKey =
        process.env.BREVO_API_KEY;

    const senderEmail =
        process.env.BREVO_SENDER_EMAIL;

    const senderName =
        process.env.BREVO_SENDER_NAME ||
        "FleetRent";

    if (
        !apiKey ||
        !senderEmail
    ) {
        throw new Error(
            "Brevo email configuration is missing."
        );
    }

    const response =
        await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": apiKey,
                    "content-type": "application/json"
                },

                body: JSON.stringify({

                    sender: {
                        name: senderName,
                        email: senderEmail
                    },

                    to: [
                        {
                            email
                        }
                    ],

                    subject:
                        "FleetRent Password Reset OTP",

                    textContent:
                        `Your FleetRent ${role} account OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,

                    htmlContent: `
                        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#172033;">
                            <h2 style="margin-bottom:8px;">FleetRent</h2>
                            <p style="color:#64748b;">Password reset verification</p>

                            <p>Your ${role} account password reset OTP is:</p>

                            <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0;">
                                ${otp}
                            </div>

                            <p style="color:#64748b;">
                                This OTP is valid for 5 minutes.
                            </p>

                            <p style="color:#64748b;">
                                Do not share this OTP with anyone.
                            </p>
                        </div>
                    `
                })
            }
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Brevo email failed: ${response.status} ${errorText}`
        );
    }

    return true;
};

module.exports = sendEmailOtp;
