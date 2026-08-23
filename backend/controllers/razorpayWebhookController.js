const crypto = require("crypto");

const Payment = require("../models/Payment");


// ============================================================
// RAZORPAY WEBHOOK
// ============================================================

const razorpayWebhook = async (req, res) => {

    try {

        // ========================================================
        // 1. GET RAW BODY
        // ========================================================

        const rawBody = req.body;

        const signature =
            req.headers["x-razorpay-signature"];


        if (!signature) {

            return res.status(400).json({
                message: "Razorpay signature missing"
            });
        }


        // ========================================================
        // 2. WEBHOOK SECRET
        // ========================================================

        const webhookSecret =
            process.env.RAZORPAY_WEBHOOK_SECRET;


        if (!webhookSecret) {

            console.error(
                "RAZORPAY_WEBHOOK_SECRET is missing"
            );

            return res.status(500).json({
                message:
                    "Webhook secret is not configured"
            });
        }


        // ========================================================
        // 3. VERIFY RAZORPAY SIGNATURE
        // ========================================================

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    webhookSecret
                )
                .update(rawBody)
                .digest("hex");


        const receivedBuffer =
            Buffer.from(signature);

        const expectedBuffer =
            Buffer.from(expectedSignature);


        if (
            receivedBuffer.length !==
                expectedBuffer.length ||
            !crypto.timingSafeEqual(
                receivedBuffer,
                expectedBuffer
            )
        ) {

            console.error(
                "Invalid Razorpay webhook signature"
            );

            return res.status(400).json({
                message:
                    "Invalid webhook signature"
            });
        }


        // ========================================================
        // 4. PARSE BODY AFTER SIGNATURE VERIFICATION
        // ========================================================

        const event =
            JSON.parse(
                rawBody.toString()
            );


        console.log(
            "Razorpay Webhook Event:",
            event.event
        );


        // ========================================================
        // 5. PAYMENT CAPTURED
        // ========================================================

        if (
            event.event ===
            "payment.captured"
        ) {

            const paymentEntity =
                event.payload
                    ?.payment
                    ?.entity;


            if (!paymentEntity) {

                return res.status(200).json({
                    message:
                        "Payment payload missing"
                });
            }


            // ====================================================
            // RAZORPAY PAYMENT DETAILS
            // ====================================================

            const razorpayPaymentId =
                paymentEntity.id;

            const razorpayOrderId =
                paymentEntity.order_id;

            const amountInPaise =
                paymentEntity.amount;


            if (!razorpayOrderId) {

                console.error(
                    "Razorpay order ID missing"
                );

                return res.status(200).json({
                    message:
                        "Order ID missing"
                });
            }


            // ====================================================
            // FIND PAYMENT
            // ====================================================

            const payment =
                await Payment.findOne({
                    "transactions.razorpayOrderId":
                        razorpayOrderId
                });


            if (!payment) {

                console.error(
                    "Payment not found for Razorpay order:",
                    razorpayOrderId
                );

                return res.status(200).json({
                    message:
                        "Payment record not found"
                });
            }


            // ====================================================
            // FIND ONLINE TRANSACTION
            // ====================================================

            const transaction =
                payment.transactions.find(
                    transaction =>
                        transaction.razorpayOrderId ===
                        razorpayOrderId
                );


            if (!transaction) {

                return res.status(200).json({
                    message:
                        "Transaction not found"
                });
            }


            // ====================================================
            // IDEMPOTENCY
            // ====================================================

            if (
                transaction.status ===
                "confirmed"
            ) {

                console.log(
                    "Razorpay transaction already confirmed:",
                    razorpayPaymentId
                );

                return res.status(200).json({
                    message:
                        "Payment already processed"
                });
            }


            // ====================================================
            // ONLY ONLINE TRANSACTIONS
            // ====================================================

            if (
                transaction.paymentMethod !==
                "online"
            ) {

                console.error(
                    "Invalid transaction payment method"
                );

                return res.status(200).json({
                    message:
                        "Invalid payment transaction"
                });
            }


            // ====================================================
            // VERIFY PAYMENT AMOUNT
            // ====================================================

            const expectedAmountInPaise =
                Math.round(
                    transaction.amount * 100
                );


            if (
                amountInPaise !==
                expectedAmountInPaise
            ) {

                console.error(
                    "Razorpay amount mismatch",
                    {
                        expected:
                            expectedAmountInPaise,

                        received:
                            amountInPaise
                    }
                );

                return res.status(400).json({
                    message:
                        "Payment amount mismatch"
                });
            }


            // ====================================================
            // CANCEL PENDING CASH TRANSACTIONS
            // ====================================================

            payment.transactions.forEach(
                existingTransaction => {

                    if (
                        existingTransaction.paymentMethod ===
                            "cash" &&

                        existingTransaction.status ===
                            "pending"
                    ) {

                        existingTransaction.status =
                            "cancelled";

                        existingTransaction.confirmedAt =
                            new Date();
                    }
                }
            );


            // ====================================================
            // CONFIRM ONLINE TRANSACTION
            // ====================================================

            transaction.razorpayPaymentId =
                razorpayPaymentId;

            transaction.transactionId =
                razorpayPaymentId;

            transaction.status =
                "confirmed";

            transaction.paidAt =
                new Date();

            transaction.confirmedAt =
                new Date();


            // ====================================================
            // UPDATE PAID AMOUNT
            // ====================================================

            payment.paidAmount +=
                transaction.amount;


            // ====================================================
            // PREVENT OVERPAYMENT
            // ====================================================

            if (
                payment.paidAmount >
                payment.dueAmount
            ) {

                payment.paidAmount =
                    payment.dueAmount;
            }


            // ====================================================
            // UPDATE PAYMENT STATUS
            // ====================================================

            if (
                payment.paidAmount >=
                payment.dueAmount
            ) {

                payment.paidAmount =
                    payment.dueAmount;

                payment.status =
                    "paid";

            } else if (
                payment.paidAmount > 0
            ) {

                payment.status =
                    "partial";

            } else {

                payment.status =
                    "pending";
            }


            // ====================================================
            // SAVE
            // ====================================================

            await payment.save();


            console.log(
                "Razorpay payment confirmed:",
                razorpayPaymentId
            );


            return res.status(200).json({
                message:
                    "Payment processed successfully"
            });
        }


        // ========================================================
        // 6. PAYMENT FAILED
        // ========================================================

        if (
            event.event ===
            "payment.failed"
        ) {

            const paymentEntity =
                event.payload
                    ?.payment
                    ?.entity;


            if (paymentEntity) {

                const razorpayOrderId =
                    paymentEntity.order_id;

                const razorpayPaymentId =
                    paymentEntity.id;


                // ================================================
                // FIND PAYMENT
                // ================================================

                const payment =
                    await Payment.findOne({
                        "transactions.razorpayOrderId":
                            razorpayOrderId
                    });


                if (payment) {

                    const transaction =
                        payment.transactions.find(
                            transaction =>
                                transaction.razorpayOrderId ===
                                razorpayOrderId
                        );


                    if (transaction) {

                        // ============================================
                        // ONLY MARK PENDING ONLINE TRANSACTION FAILED
                        // ============================================

                        if (
                            transaction.status ===
                            "pending"
                        ) {

                            transaction.razorpayPaymentId =
                                razorpayPaymentId;

                            transaction.status =
                                "failed";

                            transaction.transactionId =
                                razorpayPaymentId;

                            await payment.save();
                        }
                    }
                }
            }


            return res.status(200).json({
                message:
                    "Payment failure processed"
            });
        }


        // ========================================================
        // 7. ORDER PAID
        // ========================================================

        if (
            event.event ===
            "order.paid"
        ) {

            /*
             * payment.captured already updates
             * the database.
             *
             * Therefore we intentionally DO NOT
             * update paidAmount here.
             *
             * This prevents:
             *
             * payment.captured → +₹800
             * order.paid       → +₹800
             *
             * resulting in ₹1600.
             */

            return res.status(200).json({
                message:
                    "Order paid event received"
            });
        }


        // ========================================================
        // 8. OTHER EVENTS
        // ========================================================

        return res.status(200).json({
            message:
                "Event received"
        });


    } catch (error) {

        console.error(
            "Razorpay Webhook Error:",
            error
        );

        return res.status(500).json({
            message:
                "Webhook processing failed"
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    razorpayWebhook
};