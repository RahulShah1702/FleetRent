const express = require("express");

const {
    requireCompleteDriverProfile,
    requireCompleteBusinessProfile
} = require("../middleware/profileMiddleware");

const {
    createDailyPayment,
    payPayment,
    getMyPayments,
    getTodayPayment,
    getBusinessPayments,
    getPaymentById,
    confirmCashPayment,
    rejectCashPayment
} = require("../controllers/paymentController");

const {
    protect,
    driverOnly,
    businessOnly
} = require("../middleware/authMiddleware");

const {
    createRazorpayOrder
} = require("../controllers/paymentController");

const router = express.Router();


// Driver creates today's rent/payment record
router.post(
    "/daily",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    createDailyPayment
);

// Driver pays a payment
router.post(
    "/:id/pay",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    payPayment
);

// Driver payment history
router.get(
    "/my-history",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    getMyPayments
);

// Driver today's payment
router.get(
    "/today",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    getTodayPayment
);

// Business payment history
router.get(
    "/business",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    getBusinessPayments
);

router.get(
    "/:paymentId",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    getPaymentById
);

// Business confirms cash payment for a specific transaction
router.put(
    "/:paymentId/transactions/:transactionId/confirm-cash",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    confirmCashPayment
);

// Business rejects cash payment
router.put(
    "/:paymentId/transactions/:transactionId/reject-cash",
    protect,
    businessOnly,
    requireCompleteBusinessProfile,
    rejectCashPayment
);

router.post(
    "/:paymentId/razorpay/order",
    protect,
    driverOnly,
    requireCompleteDriverProfile,
    createRazorpayOrder
);

module.exports = router;