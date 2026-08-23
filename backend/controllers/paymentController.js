const Payment = require("../models/Payment");
const Assignment = require("../models/Assignment");
const razorpay = require("../utils/razorpay");
const Shift = require("../models/Shift");


// ============================================================
// CREATE TODAY'S PAYMENT RECORD
// ============================================================

const createDailyPayment = async (req, res) => {
    try {
        const {
            assignmentId,
            paymentDate
        } = req.body;

        // 1. Find active assignment belonging to logged-in driver
        const assignment = await Assignment.findOne({
            _id: assignmentId,
            driverId: req.user._id,
            status: "active"
        });

        if (!assignment) {
            return res.status(404).json({
                message: "Active assignment not found"
            });
        }

        // 2. Determine payment date
        const date = paymentDate
            ? new Date(paymentDate)
            : new Date();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 3. Prevent duplicate daily payment
        const existingPayment = await Payment.findOne({
            assignmentId,
            paymentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingPayment) {
            return res.status(400).json({
                message: "Payment record already exists for this date",
                payment: existingPayment
            });
        }

        // 4. Create payment
        const payment = await Payment.create({
            assignmentId: assignment._id,
            driverId: assignment.driverId,
            vehicleId: assignment.vehicleId,
            businessId: assignment.businessId,

            paymentDate: date,

            dueAmount: assignment.dailyRent,
            paidAmount: 0,

            status: "pending",

            transactions: []
        });

        res.status(201).json({
            message: "Daily payment created successfully",
            payment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// PAY PAYMENT
// ============================================================

const payPayment = async (req, res) => {
    try {
        const {
            paidAmount,
            paymentMethod,
            transactionId
        } = req.body;

        // 1. Validate amount
        if (
            paidAmount === undefined ||
            paidAmount <= 0
        ) {
            return res.status(400).json({
                message: "Paid amount must be greater than 0"
            });
        }

        // 2. Validate payment method
        if (!["cash", "online"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Payment method must be cash or online"
            });
        }

        // 3. Find payment belonging to logged-in driver
        const payment = await Payment.findOne({
            _id: req.params.id,
            driverId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // 4. Check if already fully paid
        if (payment.status === "paid") {
            return res.status(400).json({
                message: "This payment is already fully paid"
            });
        }

        // ========================================================
        // CALCULATE PENDING CASH
        // ========================================================

        const pendingCashAmount = payment.transactions
            .filter(
                transaction =>
                    transaction.paymentMethod === "cash" &&
                    transaction.status === "pending"
            )
            .reduce(
                (sum, transaction) =>
                    sum + transaction.amount,
                0
            );

        // ========================================================
        // CALCULATE AMOUNT DRIVER CAN CURRENTLY PAY
        // ========================================================

        const availableAmount =
            payment.dueAmount -
            payment.paidAmount -
            pendingCashAmount;

        // 5. Prevent overpayment
        if (paidAmount > availableAmount) {
            return res.status(400).json({
                message: `Maximum payable amount is ₹${availableAmount}`
            });
        }

        // ========================================================
        // ONLINE PAYMENT VALIDATION
        // ========================================================

        if (
            paymentMethod === "online" &&
            !transactionId
        ) {
            return res.status(400).json({
                message: "Transaction ID is required for online payment"
            });
        }

        // ========================================================
        // CREATE TRANSACTION
        // ========================================================

        const transaction = {
            amount: paidAmount,

            paymentMethod,

            transactionId:
                paymentMethod === "online"
                    ? transactionId
                    : null,

            // Cash requires Business confirmation
            status:
                paymentMethod === "cash"
                    ? "pending"
                    : "confirmed",

            paidAt:
                paymentMethod === "online"
                    ? new Date()
                    : null,

            confirmedAt:
                paymentMethod === "online"
                    ? new Date()
                    : null
        };

        payment.transactions.push(transaction);

        // ========================================================
        // ONLY CONFIRMED PAYMENTS INCREASE paidAmount
        // ========================================================

        if (paymentMethod === "online") {
            payment.paidAmount += paidAmount;
        }

        // ========================================================
        // UPDATE PAYMENT STATUS
        // ========================================================

        if (payment.paidAmount >= payment.dueAmount) {

            payment.status = "paid";

        } else if (
            payment.transactions.some(
                transaction =>
                    transaction.paymentMethod === "cash" &&
                    transaction.status === "pending"
            )
        ) {

            payment.status = "cash-pending";

        } else if (payment.paidAmount > 0) {

            payment.status = "partial";

        } else {

            payment.status = "pending";
        }

        // ========================================================
        // SAVE
        // ========================================================

        await payment.save();

        // ========================================================
        // RESPONSE
        // ========================================================

        res.status(200).json({
            message:
                paymentMethod === "cash"
                    ? "Cash payment submitted for business confirmation"
                    : "Payment recorded successfully",

            payment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// DRIVER PAYMENT HISTORY
// ============================================================

const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            driverId: req.user._id
        })
            .populate(
                "vehicleId",
                "registrationNumber"
            )
            .sort({
                paymentDate: -1
            });

        const totalDue = payments.reduce(
            (sum, payment) =>
                sum + payment.dueAmount,
            0
        );

        const totalPaid = payments.reduce(
            (sum, payment) =>
                sum + payment.paidAmount,
            0
        );

        const totalPending = totalDue - totalPaid;

        res.status(200).json({
            count: payments.length,

            summary: {
                totalDue,
                totalPaid,
                totalPending
            },

            payments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// GET TODAY'S PAYMENT
// ============================================================

// ============================================================
// GET TODAY'S PAYMENT
// ============================================================

const getTodayPayment = async (req, res) => {
    try {

        // ========================================================
        // 1. FIND ACTIVE ASSIGNMENT
        // ========================================================

        const assignment = await Assignment.findOne({
            driverId: req.user._id,
            status: "active"
        });

        if (!assignment) {
            return res.status(404).json({
                payment: null
            });
        }


        // ========================================================
        // 2. TODAY
        // ========================================================

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);


        // ========================================================
        // 3. FIND TODAY'S SHIFT
        // ========================================================

        const todayShift = await Shift.findOne({

            assignmentId: assignment._id,

            shiftDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }

        });


        // ========================================================
        // 4. DRIVER HAS NOT STARTED SHIFT
        // ========================================================

        if (
            !todayShift ||
            todayShift.status === "day-off"
        ) {

            return res.status(200).json({

                payment: null,

                message:
                    todayShift?.status === "day-off"
                        ? "Today is a day off. No rent is charged."
                        : "Shift has not been started. No rent is due."

            });

        }


        // ========================================================
        // 5. ONLY STARTED / COMPLETED SHIFT CAN HAVE PAYMENT
        // ========================================================

        const payment = await Payment.findOne({

            assignmentId: assignment._id,

            paymentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }

        }).populate(
            "vehicleId",
            "registrationNumber"
        );


        // ========================================================
        // 6. SHIFT STARTED BUT PAYMENT DOES NOT EXIST
        // ========================================================

        if (!payment) {

            return res.status(200).json({

                payment: null,

                message:
                    "Today's payment has not been created."

            });

        }


        // ========================================================
        // 7. PENDING CASH
        // ========================================================

        const pendingCashAmount =
            payment.transactions
                .filter(
                    transaction =>
                        transaction.paymentMethod === "cash" &&
                        transaction.status === "pending"
                )
                .reduce(
                    (sum, transaction) =>
                        sum + transaction.amount,
                    0
                );


        // ========================================================
        // 8. REMAINING
        // ========================================================

        const pendingAmount =
            payment.dueAmount -
            payment.paidAmount;


        // ========================================================
        // 9. RESPONSE
        // ========================================================

        res.status(200).json({

            payment: {

                id:
                    payment._id,

                date:
                    payment.paymentDate,

                vehicle:
                    payment.vehicleId,

                dueAmount:
                    payment.dueAmount,

                paidAmount:
                    payment.paidAmount,

                pendingAmount,

                pendingCashAmount,

                status:
                    payment.status,

                transactions:
                    payment.transactions

            }

        });

    } catch (error) {

        console.error(
            "Get Today's Payment Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};

// ============================================================
// GET SINGLE PAYMENT - BUSINESS
// ============================================================

const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({
            _id: paymentId,
            businessId: req.user._id
        })
        .populate("driverId", "fullName mobileNumber")
        .populate(
            "vehicleId",
            "vehicleNumber vehicleType model"
        )
        .populate(
            "assignmentId",
            "shift shiftStartTime shiftEndTime"
        );

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            payment
        });

    } catch (error) {
        console.error(
            "Get Payment By ID Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// BUSINESS PAYMENT HISTORY
// ============================================================

const getBusinessPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            businessId: req.user._id
        })
            .populate(
                "driverId",
                "fullName mobileNumber"
            )
            .populate(
                "vehicleId",
                "registrationNumber"
            )
            .populate(
                "assignmentId",
                "shift shiftStartTime shiftEndTime dailyRent"
            )
            .sort({
                paymentDate: -1
            });

        const totalDue = payments.reduce(
            (sum, payment) =>
                sum + payment.dueAmount,
            0
        );

        const totalPaid = payments.reduce(
            (sum, payment) =>
                sum + payment.paidAmount,
            0
        );

        const pendingCashPayments = payments.reduce(
            (sum, payment) => {
                return (
                    sum +
                    payment.transactions
                        .filter(
                            transaction =>
                                transaction.paymentMethod === "cash" &&
                                transaction.status === "pending"
                        )
                        .reduce(
                            (transactionSum, transaction) =>
                                transactionSum +
                                transaction.amount,
                            0
                        )
                );
            },
            0
        );

        res.status(200).json({
            count: payments.length,

            summary: {
                totalDue,

                totalPaid,

                totalPending:
                    totalDue - totalPaid,

                pendingCashPayments
            },

            payments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// BUSINESS CONFIRMS CASH PAYMENT
// ============================================================

const confirmCashPayment = async (req, res) => {
    try {
        const {
            paymentId,
            transactionId
        } = req.params;

        // 1. Find payment belonging to Business
        const payment = await Payment.findOne({
            _id: paymentId,
            businessId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // 2. Find transaction
        const transaction =
            payment.transactions.id(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 3. Make sure transaction is cash
        if (
            transaction.paymentMethod !== "cash"
        ) {
            return res.status(400).json({
                message:
                    "Only cash transactions can be confirmed this way"
            });
        }

        // 4. Already confirmed
        if (
            transaction.status === "confirmed"
        ) {
            return res.status(400).json({
                message:
                    "Cash payment is already confirmed"
            });
        }

        // 5. Already rejected
        if (
            transaction.status === "failed"
        ) {
            return res.status(400).json({
                message:
                    "This transaction has already failed"
            });
        }

        // 6. Confirm cash
        transaction.status = "confirmed";

        transaction.paidAt = new Date();

        transaction.confirmedAt = new Date();

        // 7. Add confirmed cash to paid amount
        payment.paidAmount += transaction.amount;

        // 8. Update payment status
        if (
            payment.paidAmount >=
            payment.dueAmount
        ) {

            payment.status = "paid";

        } else if (
            payment.transactions.some(
                transaction =>
                    transaction.status === "pending"
            )
        ) {

            payment.status = "cash-pending";

        } else {

            payment.status = "partial";
        }

        await payment.save();

        res.status(200).json({
            message:
                "Cash payment confirmed successfully",

            payment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// BUSINESS REJECTS CASH PAYMENT
// ============================================================

const rejectCashPayment = async (req, res) => {
    try {
        const {
            paymentId,
            transactionId
        } = req.params;

        // 1. Find payment belonging to Business
        const payment = await Payment.findOne({
            _id: paymentId,
            businessId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // 2. Find transaction
        const transaction =
            payment.transactions.id(transactionId);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        // 3. Must be cash
        if (
            transaction.paymentMethod !== "cash"
        ) {
            return res.status(400).json({
                message:
                    "Only cash transactions can be rejected"
            });
        }

        // 4. Must be pending
        if (
            transaction.status !== "pending"
        ) {
            return res.status(400).json({
                message:
                    "Only pending cash payments can be rejected"
            });
        }

        // 5. Reject transaction
        transaction.status = "failed";

        // 6. Update payment status
        const hasPendingCash =
            payment.transactions.some(
                transaction =>
                    transaction.paymentMethod === "cash" &&
                    transaction.status === "pending"
            );

        if (
            payment.paidAmount >=
            payment.dueAmount
        ) {

            payment.status = "paid";

        } else if (hasPendingCash) {

            payment.status = "cash-pending";

        } else if (
            payment.paidAmount > 0
        ) {

            payment.status = "partial";

        } else {

            payment.status = "pending";
        }

        await payment.save();

        res.status(200).json({
            message:
                "Cash payment rejected successfully",

            payment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

const createRazorpayOrder = async (req, res) => {
    try {

        const paymentId = req.params.paymentId;

        // ========================================================
        // 1. FIND PAYMENT
        // ========================================================

        const payment = await Payment.findOne({
            _id: paymentId,
            driverId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }


        // ========================================================
        // 2. CHECK WHETHER ALREADY PAID
        // ========================================================

        const remainingAmount =
            payment.dueAmount - payment.paidAmount;

        if (remainingAmount <= 0) {
            return res.status(400).json({
                message: "This payment is already fully paid"
            });
        }


        // ========================================================
        // 3. CHECK FOR EXISTING PENDING ONLINE TRANSACTION
        // ========================================================

        const existingOnlineTransaction =
            payment.transactions.find(
                transaction =>
                    transaction.paymentMethod === "online" &&
                    transaction.status === "pending" &&
                    transaction.razorpayOrderId
            );


        /*
         * If the driver already created an online order
         * but has not completed it yet, reuse that order.
         *
         * This prevents unnecessary duplicate Razorpay orders.
         */

        if (existingOnlineTransaction) {

            return res.status(200).json({

                message:
                    "Existing Razorpay order found",

                order: {
                    id:
                        existingOnlineTransaction.razorpayOrderId,

                    amount:
                        existingOnlineTransaction.amount * 100,

                    currency: "INR"
                },

                transactionId:
                    existingOnlineTransaction._id,

                keyId:
                    process.env.RAZORPAY_KEY_ID
            });
        }


        // ========================================================
        // 4. CREATE RAZORPAY ORDER
        // ========================================================

        const options = {

            amount:
                Math.round(
                    remainingAmount * 100
                ),

            currency: "INR",

            receipt:
                `fleetrent_${payment._id}_${Date.now()}`
        };


        const order =
            await razorpay.orders.create(
                options
            );


        // ========================================================
        // 5. CREATE ONLINE TRANSACTION
        // ========================================================

        const onlineTransaction = {

            amount:
                remainingAmount,

            paymentMethod:
                "online",

            transactionId:
                null,

            razorpayOrderId:
                order.id,

            razorpayPaymentId:
                null,

            razorpaySignature:
                null,

            status:
                "pending",

            paidAt:
                null,

            confirmedAt:
                null
        };


        payment.transactions.push(
            onlineTransaction
        );


        await payment.save();


        // ========================================================
        // 6. RESPONSE
        // ========================================================

        const createdTransaction =
            payment.transactions[
                payment.transactions.length - 1
            ];


        res.status(201).json({

            message:
                "Razorpay order created successfully",

            order: {

                id:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency
            },

            transactionId:
                createdTransaction._id,

            payment: {

                id:
                    payment._id,

                dueAmount:
                    payment.dueAmount,

                paidAmount:
                    payment.paidAmount,

                remainingAmount:
                    remainingAmount
            },

            keyId:
                process.env.RAZORPAY_KEY_ID
        });


    } catch (error) {

        console.error(
            "Create Razorpay Order Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to create Razorpay order"
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createDailyPayment,
    payPayment,
    getMyPayments,
    getTodayPayment,
    getBusinessPayments,
    getPaymentById,
    confirmCashPayment,
    rejectCashPayment,
    createRazorpayOrder
};