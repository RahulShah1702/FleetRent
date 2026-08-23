import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./DriverPayments.css";


function DriverPayments() {

    const navigate = useNavigate();

    const [todayPayment, setTodayPayment] =
        useState(null);

    const [payments, setPayments] =
        useState([]);

    const [summary, setSummary] =
        useState({
            totalDue: 0,
            totalPaid: 0,
            totalPending: 0
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [paymentLoading, setPaymentLoading] =
        useState(false);

    const [showPaymentOptions, setShowPaymentOptions] =
        useState(false);

    const [selectedMethod, setSelectedMethod] =
        useState("");

    // Payment currently being paid. This can be today's payment
    // or any older payment that still has an outstanding balance.
    const [selectedPayment, setSelectedPayment] =
        useState(null);


    // ============================================================
    // LOAD PAYMENTS
    // ============================================================

    const loadPayments = async () => {
    try {
        setLoading(true);
        setError("");

        // ========================================================
        // PAYMENT HISTORY
        // ========================================================

        const historyResponse =
            await api.get(
                "/payments/my-history"
            );

        setPayments(
            historyResponse.data.payments || []
        );

        setSummary(
            historyResponse.data.summary || {
                totalDue: 0,
                totalPaid: 0,
                totalPending: 0
            }
        );

        // ========================================================
        // TODAY'S PAYMENT
        // ========================================================

        try {
            const todayResponse =
                await api.get(
                    "/payments/today"
                );

            setTodayPayment(
                todayResponse.data.payment || null
            );

        } catch (todayError) {
            // No active assignment means
            // there is simply no today's payment.
            setTodayPayment(null);
        }

    } catch (error) {
        console.error(
            "Driver Payments Error:",
            error
        );

        setError(
            error.response?.data?.message ||
            "Unable to load payment history."
        );

    } finally {
        setLoading(false);
    }
};


    useEffect(() => {

        loadPayments();

    }, []);


    // ============================================================
    // FORMAT MONEY
    // ============================================================

    const formatMoney = (amount) => {

        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;
    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    };


    // ============================================================
    // FORMAT STATUS
    // ============================================================

    const formatStatus = (status) => {

        if (!status) {
            return "Pending";
        }

        return status
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {

        if (status === "paid") {
            return "payment-status paid";
        }

        if (status === "cash-pending") {
            return "payment-status cash-pending";
        }

        if (status === "partial") {
            return "payment-status partial";
        }

        return "payment-status pending";
    };


    // ============================================================
    // OPEN PAYMENT OPTIONS
    // ============================================================

    const handleMakePayment = (payment = todayPayment) => {

        if (!payment) {
            return;
        }

        const remaining =
            payment.pendingAmount ??
            (Number(payment.dueAmount || 0) -
                Number(payment.paidAmount || 0));

        if (remaining <= 0 || payment.status === "paid") {
            return;
        }

        setSelectedPayment(payment);
        setSelectedMethod("");
        setShowPaymentOptions(true);
    };


    // ============================================================
    // CASH PAYMENT
    // ============================================================

    const handleCashPayment = async () => {

        if (!selectedPayment) {
            return;
        }

        try {

            setPaymentLoading(true);
            setError("");

            const remainingAmount =
                (selectedPayment.pendingAmount ??
                    (Number(selectedPayment.dueAmount || 0) -
                        Number(selectedPayment.paidAmount || 0))) -
                (selectedPayment.pendingCashAmount || 0);


            if (remainingAmount <= 0) {

                setError(
                    "There is no amount available for a new cash payment."
                );

                return;
            }


            await api.post(
                `/payments/${selectedPayment.id}/pay`,
                {
                    paidAmount:
                        remainingAmount,

                    paymentMethod:
                        "cash"
                }
            );


            setShowPaymentOptions(false);
            setSelectedMethod("");
            setSelectedPayment(null);

            await loadPayments();

        } catch (error) {

            console.error(
                "Cash Payment Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to submit cash payment."
            );

        } finally {

            setPaymentLoading(false);
        }
    };


    // ============================================================
    // ONLINE PAYMENT
    // ============================================================

    const handleOnlinePayment = async () => {

    if (!selectedPayment) {
        return;
    }

    try {

        setPaymentLoading(true);
        setError("");

        // ========================================================
        // CREATE RAZORPAY ORDER
        // ========================================================

        const response =
            await api.post(
                `/payments/${selectedPayment.id}/razorpay/order`
            );


        const {
            order
        } = response.data;

        const keyId =
            import.meta.env.VITE_RAZORPAY_KEY_ID;


        if (!order || !order.id) {

            throw new Error(
                "Invalid Razorpay order received."
            );
        }


        if (!keyId) {

            throw new Error(
                "Razorpay key is missing."
            );
        }


        // ========================================================
        // CHECK RAZORPAY SCRIPT
        // ========================================================

        if (
            !window.Razorpay
        ) {

            throw new Error(
                "Razorpay Checkout failed to load."
            );
        }


        // ========================================================
        // RAZORPAY OPTIONS
        // ========================================================

        const options = {

            key: keyId,

            amount: order.amount,

            currency: order.currency,

            name: "FleetRent",

            description:
                "FleetRent Daily Rent Payment",

            order_id: order.id,


            // ====================================================
            // SUCCESS CALLBACK
            // ====================================================

            handler: function (paymentResponse) {

                console.log(
                    "Razorpay payment response:",
                    paymentResponse
                );


                /*
                 * IMPORTANT:
                 *
                 * Do NOT mark the payment as paid
                 * from the frontend.
                 *
                 * The backend webhook / verification
                 * is responsible for confirming payment.
                 */

                alert(
                    "Payment received. Waiting for payment confirmation..."
                );


                setShowPaymentOptions(
                    false
                );

                setSelectedMethod(
                    ""
                );


                // Refresh payment information
                setTimeout(() => {

                    loadPayments();

                }, 2000);
            },


            // ====================================================
            // PREFILL
            // ====================================================

            prefill: {
                name: "",
                email: "",
                contact: ""
            },


            theme: {
                color: "#2563eb"
            },


            modal: {

                ondismiss: function () {

                    setPaymentLoading(
                        false
                    );

                }

            }

        };


        // ========================================================
        // OPEN RAZORPAY
        // ========================================================

        const razorpayCheckout =
            new window.Razorpay(
                options
            );


        razorpayCheckout.on(
            "payment.failed",
            function (response) {

                console.error(
                    "Razorpay payment failed:",
                    response.error
                );


                setError(
                    response.error?.description ||
                    "Razorpay payment failed."
                );

                setPaymentLoading(
                    false
                );
            }
        );


        razorpayCheckout.open();


    } catch (error) {

        console.error(
            "Online Payment Error:",
            error
        );


        setError(
            error.response?.data?.message ||
            error.message ||
            "Unable to start online payment."
        );


        setPaymentLoading(
            false
        );
    }
};


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="driver-payments-page">

                <div className="driver-payments-container">

                    <button
                        type="button"
                        className="payments-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="payments-loading">
                        Loading payments...
                    </div>

                </div>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error && !todayPayment) {

        return (

            <div className="driver-payments-page">

                <div className="driver-payments-container">

                    <button
                        type="button"
                        className="payments-back-button"
                        onClick={() =>
                            navigate(
                                "/driver/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="payments-error">
                        {error}
                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="driver-payments-page">

            <div className="driver-payments-container">


                {/* ====================================================
                    BACK
                ==================================================== */}

                <button
                    type="button"
                    className="payments-back-button"
                    onClick={() =>
                        navigate(
                            "/driver/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>


                {/* ====================================================
                    HEADER
                ==================================================== */}

                <div className="payments-header">

                    <div>

                        <p className="payments-eyebrow">
                            FleetRent
                        </p>

                        <h1>
                            Payments
                        </h1>

                        <p>
                            Manage your daily rent
                            payments.
                        </p>

                    </div>

                </div>


                {/* ====================================================
                    ERROR
                ==================================================== */}

                {error && (

                    <div className="payments-error">
                        {error}
                    </div>

                )}


                {/* ====================================================
                    SUMMARY
                ==================================================== */}

                <section className="payment-summary">

                    <div className="summary-item">

                        <span>
                            Total Rent Paid
                        </span>

                        <strong>
                            {formatMoney(
                                summary.totalDue
                            )}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span>
                            Total Paid
                        </span>

                        <strong className="paid-value">
                            {formatMoney(
                                summary.totalPaid
                            )}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span>
                            Total Pending
                        </span>

                        <strong className="pending-value">
                            {formatMoney(
                                summary.totalPending
                            )}
                        </strong>

                    </div>

                </section>


                {/* ====================================================
                    TODAY'S PAYMENT
                ==================================================== */}

                {todayPayment && (

                    <section className="today-payment-card">

                        <div className="today-payment-header">

                            <div>

                                <span className="card-label">
                                    Today's Payment
                                </span>

                                <h2>
                                    {formatDate(
                                        todayPayment.date
                                    )}
                                </h2>

                            </div>


                            <span
                                className={getStatusClass(
                                    todayPayment.status
                                )}
                            >
                                {formatStatus(
                                    todayPayment.status
                                )}
                            </span>

                        </div>


                        <div className="today-payment-details">


                            <div>

                                <span>
                                    Vehicle
                                </span>

                                <strong>
                                    {
                                        todayPayment
                                            .vehicle
                                            ?.registrationNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Amount Due
                                </span>

                                <strong>
                                    {formatMoney(
                                        todayPayment.dueAmount
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong className="paid-value">
                                    {formatMoney(
                                        todayPayment.paidAmount
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Remaining
                                </span>

                                <strong className="pending-value">
                                    {formatMoney(
                                        todayPayment.pendingAmount
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* ====================================================
                            PENDING CASH NOTICE
                            ==================================================== */}

                        {todayPayment.pendingCashAmount > 0 && (

                            <div className="cash-pending-notice">

                                <strong>
                                    Cash payment awaiting confirmation
                                </strong>

                                <span>
                                    {formatMoney(
                                        todayPayment.pendingCashAmount
                                    )}
                                    {" "}has been submitted to the
                                    business and is waiting for confirmation.
                                </span>

                            </div>

                        )}


                        {/* ====================================================
                            PAYMENT BUTTON
                            ==================================================== */}

                        {todayPayment.pendingAmount > 0 &&
                            todayPayment.status !== "paid" && (

                            <div className="today-payment-action">

                                <button
                                    type="button"
                                    className="make-payment-button"
                                    onClick={() => handleMakePayment(todayPayment)}
                                >
                                    Make Payment
                                </button>

                            </div>

                        )}

                    </section>

                )}


                {/* ====================================================
                    PENDING PAYMENTS
                ==================================================== */}


                {summary.totalPending > 0 && (
                
                    <section className="pending-payments-section">
                    
                        <div className="history-section-header">
                
                            <div>
                                <h2>
                                    Pending Rent
                                </h2>
                
                                <p>
                                    You have unpaid rent from previous shifts.
                                </p>
                            </div>
                
                        </div>
                
                
                        <div className="pending-rent-card">
                
                            <div className="pending-rent-info">
                
                                <span>
                                    Total Pending Rent
                                </span>
                
                                <strong className="pending-value">
                                    {formatMoney(
                                        summary.totalPending
                                    )}
                                </strong>
                                
                            </div>
                                
                            
                            <button
                                type="button"
                                className="make-payment-button pending-pay-button"
                                onClick={() => {
                                
                                    /*
                                     * Find the oldest unpaid payment.
                                     *
                                     * We pay one payment at a time so that
                                     * every rent record remains correctly
                                     * associated with its date and vehicle.
                                     */
                                
                                    const unpaidPayment =
                                        payments.find(payment =>
                                            Number(
                                                payment.dueAmount || 0
                                            ) >
                                            Number(
                                                payment.paidAmount || 0
                                            )
                                        );
                                    
                                    
                                    if (!unpaidPayment) {
                                        return;
                                    }
                                
                                
                                    const remaining =
                                        Number(
                                            unpaidPayment.dueAmount || 0
                                        ) -
                                        Number(
                                            unpaidPayment.paidAmount || 0
                                        );


                    handleMakePayment({

                        id:
                            unpaidPayment._id,

                        date:
                            unpaidPayment.paymentDate,

                        vehicle:
                            unpaidPayment.vehicleId,

                        dueAmount:
                            unpaidPayment.dueAmount,

                        paidAmount:
                            unpaidPayment.paidAmount,

                        pendingAmount:
                            remaining,

                        pendingCashAmount:
                            (
                                unpaidPayment.transactions ||
                                []
                            )
                                .filter(transaction =>
                                    transaction.paymentMethod ===
                                        "cash" &&
                                    transaction.status ===
                                        "pending"
                                )
                                .reduce(
                                    (
                                        sum,
                                        transaction
                                    ) =>
                                        sum +
                                        Number(
                                            transaction.amount ||
                                            0
                                        ),
                                    0
                                ),

                        status:
                            unpaidPayment.status

                    });

                }}
            >
                Pay Pending Rent
            </button>

        </div>

    </section>

)}


                {/* ====================================================
                    PAYMENT HISTORY
                ==================================================== */}

                <section className="payment-history-section">

                    <div className="history-section-header">

                        <div>

                            <h2>
                                Payment History
                            </h2>

                            <p>
                                Your previous rent payments.
                            </p>

                        </div>

                    </div>


                    {payments.length === 0 ? (

                        <div className="payment-history-empty">

                            <p>
                                No payment history available.
                            </p>

                        </div>

                    ) : (

                        <div className="payment-history-list">

                            {payments.map(
                                (payment) => (

                                    <div
                                        className="payment-history-card"
                                        key={payment._id}
                                    >

                                        <div>

                                            <span className="history-payment-date">
                                                {formatDate(
                                                    payment.paymentDate
                                                )}
                                            </span>

                                            <strong>
                                                {formatMoney(
                                                    payment.dueAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div className="history-payment-middle">

                                            <span>
                                                Vehicle
                                            </span>

                                            <strong>
                                                {
                                                    payment
                                                        .vehicleId
                                                        ?.registrationNumber ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>


                                        <div className="history-payment-middle">

                                            <span>
                                                Paid
                                            </span>

                                            <strong>
                                                {formatMoney(
                                                    payment.paidAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span
                                                className={getStatusClass(
                                                    payment.status
                                                )}
                                            >
                                                {formatStatus(
                                                    payment.status
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ====================================================
                    PAYMENT MODAL
                ==================================================== */}

                {showPaymentOptions && (

                    <div className="payment-modal-overlay">

                        <div className="payment-modal">

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {

                                    setShowPaymentOptions(
                                        false
                                    );

                                    setSelectedMethod(
                                        ""
                                    );
                                    setSelectedPayment(null);

                                }}
                            >
                                ×
                            </button>


                            <h2>
                                Choose Payment Method
                            </h2>

                            <p>
                                {selectedPayment
                                    ? `Pay ${formatMoney(
                                          selectedPayment.pendingAmount ??
                                          (Number(selectedPayment.dueAmount || 0) -
                                              Number(selectedPayment.paidAmount || 0))
                                      )} for ${formatDate(selectedPayment.date)}`
                                    : "Select how you want to pay your remaining rent."}
                            </p>


                            <div className="payment-methods">


                                {/* CASH */}

                                <button
                                    type="button"
                                    className={
                                        selectedMethod ===
                                        "cash"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                    onClick={() =>
                                        setSelectedMethod(
                                            "cash"
                                        )
                                    }
                                >

                                    <span className="method-icon">
                                        ₹
                                    </span>

                                    <span>

                                        <strong>
                                            Cash
                                        </strong>

                                        <small>
                                            Business will confirm
                                            the payment.
                                        </small>

                                    </span>

                                </button>


                                {/* ONLINE */}

                                <button
                                    type="button"
                                    className={
                                        selectedMethod ===
                                        "online"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                    onClick={() =>
                                        setSelectedMethod(
                                            "online"
                                        )
                                    }
                                >

                                    <span className="method-icon">
                                        💳
                                    </span>

                                    <span>

                                        <strong>
                                            Online
                                        </strong>

                                        <small>
                                            Pay securely using
                                            Razorpay.
                                        </small>

                                    </span>

                                </button>

                            </div>


                            {selectedMethod && (

                                <button
                                    type="button"
                                    className="confirm-payment-button"
                                    disabled={
                                        paymentLoading
                                    }
                                    onClick={
                                        selectedMethod ===
                                        "cash"
                                            ? handleCashPayment
                                            : handleOnlinePayment
                                    }
                                >

                                    {paymentLoading
                                        ? "Processing..."
                                        : selectedMethod ===
                                          "cash"
                                        ? "Submit Cash Payment"
                                        : "Continue to Razorpay"}

                                </button>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}


export default DriverPayments;