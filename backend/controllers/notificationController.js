const Notification = require("../models/Notification");
const PushSubscription = require("../models/PushSubscription");


// ============================================================
// SAVE PUSH SUBSCRIPTION
// ============================================================

const savePushSubscription = async (req, res) => {

    try {

        const {
            endpoint,
            keys
        } = req.body;


        // --------------------------------------------------------
        // Validate subscription
        // --------------------------------------------------------

        if (
            !endpoint ||
            !keys?.p256dh ||
            !keys?.auth
        ) {

            return res.status(400).json({
                message: "Invalid push subscription"
            });

        }


        // --------------------------------------------------------
        // IMPORTANT
        //
        // authMiddleware sets:
        //
        // req.user     = actual Driver / Business document
        // req.userType = "driver" / "business"
        //
        // Do NOT use req.user.role.
        // --------------------------------------------------------

        if (
            !req.user?._id ||
            !req.userType
        ) {

            return res.status(401).json({
                message: "Unable to identify notification recipient"
            });

        }


        // --------------------------------------------------------
        // Only allow valid notification user types
        // --------------------------------------------------------

        if (
            req.userType !== "driver" &&
            req.userType !== "business"
        ) {

            return res.status(400).json({
                message: "Invalid user type"
            });

        }


        // --------------------------------------------------------
        // Save / update subscription
        // --------------------------------------------------------

        const subscription =
            await PushSubscription.findOneAndUpdate(

                {
                    endpoint
                },

                {
                    userId:
                        req.user._id,

                    userType:
                        req.userType,

                    endpoint,

                    p256dh:
                        keys.p256dh,

                    auth:
                        keys.auth
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );


        console.log(
            "Push subscription saved:",
            {
                userId: req.user._id.toString(),
                userType: req.userType,
                subscriptionId: subscription._id.toString()
            }
        );


        res.status(200).json({

            message:
                "Push subscription saved",

            subscriptionId:
                subscription._id

        });

    } catch (error) {

        console.error(
            "Save Push Subscription Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};



// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

const getMyNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find({

                recipientId:
                    req.user._id,

                recipientType:
                    req.userType

            })
            .sort({
                createdAt: -1
            })
            .limit(50);


        const unreadCount =
            await Notification.countDocuments({

                recipientId:
                    req.user._id,

                recipientType:
                    req.userType,

                isRead: false

            });


        res.status(200).json({

            notifications,

            unreadCount

        });

    } catch (error) {

        console.error(
            "Get Notifications Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};



// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

const markNotificationRead = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOne({

                _id:
                    req.params.id,

                recipientId:
                    req.user._id,

                recipientType:
                    req.userType

            });


        if (!notification) {

            return res.status(404).json({

                message:
                    "Notification not found"

            });

        }


        notification.isRead = true;

        await notification.save();


        res.status(200).json({

            message:
                "Notification marked as read",

            notification

        });

    } catch (error) {

        console.error(
            "Mark Notification Read Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};



// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

const markAllNotificationsRead = async (
    req,
    res
) => {

    try {

        await Notification.updateMany(

            {

                recipientId:
                    req.user._id,

                recipientType:
                    req.userType,

                isRead: false

            },

            {

                $set: {
                    isRead: true
                }

            }

        );


        res.status(200).json({

            message:
                "All notifications marked as read"

        });

    } catch (error) {

        console.error(
            "Mark All Notifications Read Error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};



// ============================================================
// CREATE NOTIFICATION
// ============================================================

const createNotification = async ({
    recipientId,
    recipientType,
    type,
    title,
    message,
    relatedId = null
}) => {

    try {

        // --------------------------------------------------------
        // Prevent duplicate notification
        // --------------------------------------------------------

        if (relatedId) {

            const existing =
                await Notification.findOne({

                    recipientId,

                    recipientType,

                    type,

                    relatedId

                });


            if (existing) {

                return existing;

            }

        }


        return await Notification.create({

            recipientId,

            recipientType,

            type,

            title,

            message,

            relatedId,

            isRead: false

        });

    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );

        return null;

    }
};



// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getMyNotifications,

    markNotificationRead,

    markAllNotificationsRead,

    createNotification,

    savePushSubscription

};