import { useState } from "react";

import {
    createRazorpayOrder,
    verifyRazorpayPayment
} from "../../services/paymentService";

import { loadRazorpay } from "../../utils/loadRazorpay";


const RazorpayPayment = ({
    payment,
    driver
}) => {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handlePayment = async () => {

        try {

            setLoading(true);
            setError("");


            // =================================================
            // 1. Load Razorpay Checkout
            // =================================================

            const loaded =
                await loadRazorpay();

            if (!loaded) {

                setError(
                    "Razorpay Checkout failed to load"
                );

                return;
            }


            // =================================================
            // 2. Get token
            // =================================================

            const token =
                localStorage.getItem("driverToken");

            if (!token) {

                setError(
                    "Driver authentication required"
                );

                return;
            }


            // =================================================
            // 3. Create Razorpay Order
            // =================================================

            const orderResponse =
                await createRazorpayOrder(
                    payment._id,
                    token
                );


            const {
                order,
                transactionId
            } = orderResponse;


            // =================================================
            // 4. Razorpay Checkout options
            // =================================================

            const options = {

                key:
                    import.meta.env
                        .VITE_RAZORPAY_KEY_ID,

                amount:
                    order.amount,

                currency:
                    order.currency,

                name:
                    "FleetRent",

                description:
                    "Fleet vehicle payment",

                order_id:
                    order.id,


                prefill: {

                    name:
                        driver.fullName,

                    email:
                        driver.email,

                    contact:
                        `+91${driver.mobileNumber}`
                },


                theme: {
                    color: "#3399cc"
                },


                // =================================================
                // 5. Payment success handler
                // =================================================

                handler:
                    async function (
                        response
                    ) {

                        try {

                            const verificationData =
                                {
                                    transactionId,

                                    razorpayPaymentId:
                                        response
                                            .razorpay_payment_id,

                                    razorpayOrderId:
                                        response
                                            .razorpay_order_id,

                                    razorpaySignature:
                                        response
                                            .razorpay_signature
                                };


                            const result =
                                await verifyRazorpayPayment(
                                    payment._id,
                                    verificationData,
                                    token
                                );


                            console.log(
                                "Payment verified:",
                                result
                            );


                            alert(
                                "Payment successful!"
                            );


                            // Refresh page/data
                            window.location.reload();

                        } catch (error) {

                            console.error(
                                "Verification error:",
                                error
                            );

                            alert(
                                "Payment verification failed"
                            );
                        }
                    },


                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                "Razorpay Checkout closed"
                            );
                        }
                }
            };


            // =================================================
            // 6. Open Razorpay
            // =================================================

            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function (response) {

                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    setError(
                        response.error
                            ?.description ||
                        "Payment failed"
                    );
                }
            );


            razorpay.open();

        } catch (error) {

            console.error(
                "Razorpay Error:",
                error
            );

            setError(
                error.response
                    ?.data?.message ||
                "Unable to start payment"
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div>

            <button
                onClick={handlePayment}
                disabled={loading}
            >
                {loading
                    ? "Processing..."
                    : `Pay ₹${
                        payment.dueAmount -
                        payment.paidAmount
                    } Online`
                }
            </button>


            {error && (
                <p>
                    {error}
                </p>
            )}

        </div>
    );
};


export default RazorpayPayment;