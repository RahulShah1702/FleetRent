import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api
    from "../../services/api";

import "./Payment.css";


function Payment() {

    const navigate =
        useNavigate();


    const [payments, setPayments] =
        useState([]);

    const [summary, setSummary] =
        useState({
            totalDue: 0,
            totalPaid: 0,
            totalPending: 0,
            pendingCashPayments: 0
        });


    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");


    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [selectedTransaction, setSelectedTransaction] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);


    // ============================================================
    // LOAD PAYMENTS
    // ============================================================

    const loadPayments = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/payments/business"
                );


            setPayments(
                response.data.payments ||
                []
            );


            setSummary(
                response.data.summary || {
                    totalDue: 0,
                    totalPaid: 0,
                    totalPending: 0,
                    pendingCashPayments: 0
                }
            );


        } catch (err) {

            console.error(
                "Business Payments Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load payments."
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

    const formatMoney = (
        value
    ) => {

        return (
            `₹${Number(
                value || 0
            ).toLocaleString(
                "en-IN"
            )}`
        );

    };


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (
        value
    ) => {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };

    // ============================================================
    // CALL DRIVER
    // ============================================================

    const callDriver = (payment) => {
        const mobileNumber =
            payment?.driverId?.mobileNumber;

        if (!mobileNumber) {
            return;
        }

        window.location.href =
            `tel:${mobileNumber}`;
    };


    // ============================================================
    // STATUS
    // ============================================================

    const getPaymentStatus = (
        payment
    ) => {

        if (
            payment.status ===
            "paid"
        ) {
            return "Paid";
        }


        if (
            payment.status ===
            "partial"
        ) {
            return "Partial";
        }


        if (
            payment.status ===
            "cash-pending"
        ) {
            return "Cash Pending";
        }


        return "Pending";

    };


    const getStatusClass = (
        payment
    ) => {

        if (
            payment.status ===
            "paid"
        ) {
            return "paid";
        }


        if (
            payment.status ===
            "partial"
        ) {
            return "partial";
        }


        if (
            payment.status ===
            "cash-pending"
        ) {
            return "cash-pending";
        }


        return "pending";

    };


    // ============================================================
    // FILTER
    // ============================================================

    const filteredPayments =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return payments.filter(
                    (payment) => {

                        const vehicle =
                            payment
                                .vehicleId
                                ?.registrationNumber ||
                            "";


                        const driver =
                            payment
                                .driverId
                                ?.fullName ||
                            "";


                        const mobile =
                            payment
                                .driverId
                                ?.mobileNumber ||
                            "";


                        const matchesSearch =
                            !query ||

                            vehicle
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            driver
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            mobile
                                .toLowerCase()
                                .includes(
                                    query
                                );


                        const matchesStatus =
                            statusFilter ===
                                "all" ||

                            payment.status ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            },

            [
                payments,
                search,
                statusFilter
            ]

        );


    // ============================================================
    // OPEN DETAILS
    // ============================================================

    const openDetails = async (
        payment
    ) => {

        try {

            setError("");


            const response =
                await api.get(
                    `/payments/${payment._id}`
                );


            setSelectedPayment(
                response.data.payment
            );


            setShowDetails(
                true
            );


        } catch (err) {

            console.error(
                "Payment Details Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load payment details."
            );

        }

    };


    // ============================================================
    // CLOSE DETAILS
    // ============================================================

    const closeDetails = () => {

        if (actionLoading) {
            return;
        }


        setShowDetails(
            false
        );

        setSelectedPayment(
            null
        );

        setSelectedTransaction(
            null
        );

    };


    // ============================================================
    // CONFIRM CASH
    // ============================================================

    const confirmCashPayment =
        async () => {

            if (
                !selectedPayment ||
                !selectedTransaction
            ) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Confirm that this cash payment was received?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(true);

                setError("");

                setSuccess("");


                await api.put(

                    `/payments/${selectedPayment._id}/transactions/${selectedTransaction._id}/confirm-cash`

                );


                setSuccess(
                    "Cash payment confirmed successfully."
                );


                await loadPayments();


                setShowDetails(
                    false
                );

                setSelectedPayment(
                    null
                );

                setSelectedTransaction(
                    null
                );


            } catch (err) {

                console.error(
                    "Confirm Cash Error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Unable to confirm cash payment."
                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    // ============================================================
    // REJECT CASH
    // ============================================================

    const rejectCashPayment =
        async () => {

            if (
                !selectedPayment ||
                !selectedTransaction
            ) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Reject this cash payment request?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(true);

                setError("");

                setSuccess("");


                await api.put(

                    `/payments/${selectedPayment._id}/transactions/${selectedTransaction._id}/reject-cash`

                );


                setSuccess(
                    "Cash payment has been rejected."
                );


                await loadPayments();


                setShowDetails(
                    false
                );

                setSelectedPayment(
                    null
                );

                setSelectedTransaction(
                    null
                );


            } catch (err) {

                console.error(
                    "Reject Cash Error:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Unable to reject cash payment."
                );


            } finally {

                setActionLoading(
                    false
                );

            }

        };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className=
                    "business-payment-page"
            >

                <div
                    className=
                        "business-payment-loading"
                >
                    Loading payments...
                </div>

            </div>

        );

    }


    // ============================================================
    // MAIN
    // ============================================================

    return (

        <div
            className=
                "business-payment-page"
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className=
                    "business-payment-header"
            >

                <div>

                    <button
                        className=
                            "business-payment-back"

                        onClick={() =>
                            navigate(
                                "/business/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>


                    <p
                        className=
                            "business-payment-eyebrow"
                    >
                        FLEETRENT
                    </p>


                    <h1>
                        Payments
                    </h1>


                    <p
                        className=
                            "business-payment-subtitle"
                    >
                        Monitor rent payments across your fleet.
                    </p>

                </div>

            </header>


            {/* ====================================================
                ALERTS
            ==================================================== */}

            {error && (

                <div
                    className=
                        "business-payment-error"
                >
                    {error}
                </div>

            )}


            {success && (

                <div
                    className=
                        "business-payment-success"
                >
                    {success}
                </div>

            )}


            {/* ====================================================
                SUMMARY
            ==================================================== */}

            <section
                className=
                    "business-payment-summary"
            >

                <div>

                    <span>
                        Total Due
                    </span>

                    <strong>
                        {
                            formatMoney(
                                summary.totalDue
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Total Paid
                    </span>

                    <strong
                        className=
                            "payment-paid"
                    >
                        {
                            formatMoney(
                                summary.totalPaid
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Total Pending
                    </span>

                    <strong
                        className=
                            "payment-pending"
                    >
                        {
                            formatMoney(
                                summary.totalPending
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Pending Cash
                    </span>

                    <strong
                        className=
                            "payment-cash"
                    >
                        {
                            formatMoney(
                                summary.pendingCashPayments
                            )
                        }
                    </strong>

                </div>

            </section>


            {/* ====================================================
                FILTERS
            ==================================================== */}

            <section
                className=
                    "business-payment-toolbar"
            >

                <div
                    className=
                        "business-payment-search"
                >

                    <span>
                        🔎
                    </span>


                    <input
                        type="text"
                        placeholder=
                            "Search vehicle, driver or mobile..."
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={
                        statusFilter
                    }
                    onChange={(
                        event
                    ) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Payments
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="cash-pending">
                        Cash Pending
                    </option>

                    <option value="partial">
                        Partial
                    </option>

                    <option value="paid">
                        Paid
                    </option>

                </select>

            </section>


            {/* ====================================================
                PAYMENT LIST
            ==================================================== */}

            <section
                className=
                    "business-payment-list-card"
            >

                <div
                    className=
                        "business-payment-list-heading"
                >

                    <div>

                        <p>
                            PAYMENT HISTORY
                        </p>

                        <h2>
                            Fleet Payments
                        </h2>

                    </div>


                    <span>
                        {
                            filteredPayments.length
                        }
                        {" "}
                        record
                        {
                            filteredPayments.length !==
                            1
                                ? "s"
                                : ""
                        }
                    </span>

                </div>


                {filteredPayments.length ===
                    0 ? (

                    <div
                        className=
                            "business-payment-empty"
                    >

                        <div>
                            ₹
                        </div>

                        <h3>
                            No payments found
                        </h3>

                        <p>
                            No payment records match your current search or filter.
                        </p>

                    </div>

                ) : (

                    <div
                        className=
                            "business-payment-table-wrapper"
                    >

                        <table
                            className=
                                "business-payment-table"
                        >

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Vehicle
                                    </th>

                                    <th>
                                        Driver
                                    </th>

                                    <th>
                                        Due
                                    </th>

                                    <th>
                                        Paid
                                    </th>

                                    <th>
                                        Remaining
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredPayments.map(
                                    (payment) => {

                                        const remaining =
                                            Math.max(
                                                0,
                                                Number(
                                                    payment.dueAmount ||
                                                    0
                                                ) -
                                                Number(
                                                    payment.paidAmount ||
                                                    0
                                                )
                                            );


                                        return (

                                            <tr
                                                key={
                                                    payment._id
                                                }
                                            >

                                                <td>

                                                    {
                                                        formatDate(
                                                            payment.paymentDate
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            payment
                                                                .vehicleId
                                                                ?.registrationNumber ||
                                                            "—"
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            payment
                                                                .driverId
                                                                ?.fullName ||
                                                            "—"
                                                        }

                                                    </strong>


                                                    <small>

                                                        {
                                                            payment
                                                                .driverId
                                                                ?.mobileNumber ||
                                                            ""
                                                        }

                                                    </small>

                                                </td>


                                                <td>

                                                    {
                                                        formatMoney(
                                                            payment.dueAmount
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <strong
                                                        className=
                                                            "payment-table-paid"
                                                    >
                                                        {
                                                            formatMoney(
                                                                payment.paidAmount
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong
                                                        className=
                                                            "payment-table-remaining"
                                                    >
                                                        {
                                                            formatMoney(
                                                                remaining
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `business-payment-status ${
                                                                getStatusClass(
                                                                    payment
                                                                )
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            getPaymentStatus(
                                                                payment
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    <div className="business-payment-actions">
                                                                                                    
                                                        <button
                                                            className="business-payment-view-button"
                                                            onClick={() =>
                                                                openDetails(payment)
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                        
                                                        {remaining > 0 &&
                                                            payment.driverId?.mobileNumber && (
                                                                <button
                                                                    type="button"
                                                                    className="business-payment-call-button"
                                                                    onClick={() =>
                                                                        callDriver(payment)
                                                                    }
                                                                >
                                                                    📞 Call
                                                                </button>
                                                            )}
                                                
                                                    </div>
                                                </td>

                                            </tr>

                                        );

                                    }

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* ====================================================
                PAYMENT DETAILS MODAL
            ==================================================== */}

            {showDetails &&
                selectedPayment && (

                <div
                    className=
                        "business-payment-modal-overlay"
                >

                    <div
                        className=
                            "business-payment-modal"
                    >

                        <div
                            className=
                                "business-payment-modal-header"
                        >

                            <div>

                                <p>
                                    PAYMENT DETAILS
                                </p>

                                <h2>
                                    {
                                        selectedPayment
                                            .vehicleId
                                            ?.registrationNumber ||
                                        "Payment"
                                    }
                                </h2>

                            </div>


                            <button
                                onClick={
                                    closeDetails
                                }
                                className=
                                    "business-payment-close"
                            >
                                ×
                            </button>

                        </div>


                        <div
                            className=
                                "business-payment-details"
                        >

                            <div>

                                <span>
                                    Driver
                                </span>

                                <strong>
                                    {
                                        selectedPayment
                                            .driverId
                                            ?.fullName ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Mobile
                                </span>

                                <strong>
                                    {
                                        selectedPayment
                                            .driverId
                                            ?.mobileNumber ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Payment Date
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            selectedPayment.paymentDate
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Due
                                </span>

                                <strong>
                                    {
                                        formatMoney(
                                            selectedPayment.dueAmount
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong
                                    className=
                                        "payment-paid"
                                >
                                    {
                                        formatMoney(
                                            selectedPayment.paidAmount
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Remaining
                                </span>

                                <strong
                                    className=
                                        "payment-pending"
                                >
                                    {
                                        formatMoney(
                                            Math.max(
                                                0,
                                                Number(
                                                    selectedPayment.dueAmount ||
                                                    0
                                                ) -
                                                Number(
                                                    selectedPayment.paidAmount ||
                                                    0
                                                )
                                            )
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* TRANSACTIONS */}

                        <div
                            className=
                                "business-payment-transactions"
                        >

                            <div
                                className=
                                    "business-payment-transactions-header"
                            >

                                <h3>
                                    Transactions
                                </h3>

                                <span>
                                    {
                                        selectedPayment
                                            .transactions
                                            ?.length ||
                                        0
                                    }
                                </span>

                            </div>


                            {!selectedPayment.transactions ||
                                selectedPayment.transactions.length ===
                                0 ? (

                                <div
                                    className=
                                        "business-payment-no-transactions"
                                >
                                    No transactions recorded.
                                </div>

                            ) : (

                                <div
                                    className=
                                        "business-payment-transaction-list"
                                >

                                    {selectedPayment.transactions.map(
                                        (transaction) => {

                                            const isPendingCash =
                                                transaction.paymentMethod ===
                                                    "cash" &&
                                                transaction.status ===
                                                    "pending";


                                            return (

                                                <div
                                                    className=
                                                        "business-payment-transaction"
                                                    key={
                                                        transaction._id
                                                    }
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                transaction
                                                                    .paymentMethod ===
                                                                "cash"
                                                                    ? "Cash"
                                                                    : "Online"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                transaction.status
                                                            }
                                                        </span>

                                                    </div>


                                                    <strong>
                                                        {
                                                            formatMoney(
                                                                transaction.amount
                                                            )
                                                        }
                                                    </strong>


                                                    {isPendingCash && (

                                                        <div
                                                            className=
                                                                "business-payment-transaction-actions"
                                                        >

                                                            <button
                                                                className=
                                                                    "confirm-cash-button"

                                                                onClick={() => {

                                                                    setSelectedTransaction(
                                                                        transaction
                                                                    );

                                                                    setTimeout(
                                                                        confirmCashPayment,
                                                                        0
                                                                    );

                                                                }}

                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                Confirm Cash
                                                            </button>


                                                            <button
                                                                className=
                                                                    "reject-cash-button"

                                                                onClick={() => {

                                                                    setSelectedTransaction(
                                                                        transaction
                                                                    );

                                                                    setTimeout(
                                                                        rejectCashPayment,
                                                                        0
                                                                    );

                                                                }}

                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                Reject
                                                            </button>

                                                        </div>

                                                    )}

                                                </div>

                                            );

                                        }

                                    )}

                                </div>

                            )}

                        </div>


                        <div
                            className=
                                "business-payment-modal-footer"
                        >

                            <button
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Payment;