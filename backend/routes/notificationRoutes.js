const express = require("express");

const {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    savePushSubscription
} = require("../controllers/notificationController");

const {
    protect
} = require("../middleware/authMiddleware");


const router = express.Router();


// Get notifications

router.get(
    "/",
    protect,
    getMyNotifications
);


// Mark one as read

router.put(
    "/:id/read",
    protect,
    markNotificationRead
);


// Mark all as read

router.put(
    "/read-all",
    protect,
    markAllNotificationsRead
);

router.post(
    "/push/subscribe",
    protect,
    savePushSubscription
);


module.exports = router;