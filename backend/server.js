const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const driverRoutes = require("./routes/driverRoutes");
const businessRoutes = require("./routes/businessRoutes");
const testRoutes = require("./routes/testRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const driverProfileRoutes = require("./routes/driverProfileRoutes");
const businessProfileRoutes = require("./routes/businessProfileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const {checkShiftReminders} = require("./services/shiftNotificationService");
const passwordResetRoutes = require("./routes/passwordResetRoutes");

const {
    razorpayWebhook
} = require("./controllers/razorpayWebhookController");

const connectDB = require("./config/db");


// ============================================================
// APP
// ============================================================

const app = express();


// ============================================================
// DATABASE
// ============================================================

connectDB();


// ============================================================
// CORS
// ============================================================

app.use(cors());


// ============================================================
// RAZORPAY WEBHOOK
// IMPORTANT: MUST COME BEFORE express.json()
// ============================================================

app.post(
    "/api/webhooks/razorpay",
    express.raw({
        type: "application/json"
    }),
    razorpayWebhook
);


// ============================================================
// NORMAL JSON BODY
// ============================================================

app.use(express.json());


// ============================================================
// PORT
// ============================================================

const PORT = process.env.PORT || 5000;


// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
    res.json({
        message: "FleetRent Backend is running"
    });
});


// ============================================================
// ROUTES
// ============================================================

app.use("/api/drivers", driverRoutes);

app.use("/api/business", businessRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/test", testRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/shifts", shiftRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/auth/google", googleAuthRoutes);

app.use("/api/auth/password-reset", passwordResetRoutes);

app.use("/api/driver/profile", driverProfileRoutes);

app.use("/api/business/profile", businessProfileRoutes);

app.use("/api/notifications", notificationRoutes
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        checkShiftReminders();

        setInterval(
            checkShiftReminders,
            60 * 1000
        );

    }
);