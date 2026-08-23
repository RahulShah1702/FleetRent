const Notification =
    require("../models/Notification");


const createNotification = async ({
    recipientId,
    recipientType,
    type,
    title,
    message,
    relatedId = null,
    dedupeKey = null
}) => {

    try {

        // --------------------------------------------------------
        // Prevent duplicate notification
        // --------------------------------------------------------

        if (dedupeKey) {

            const existing =
                await Notification.findOne({
                    dedupeKey
                });

            // IMPORTANT:
            // Notification already exists.
            // Return null so callers know that a NEW
            // notification was NOT created.
            if (existing) {
                return null;
            }
        }


        // --------------------------------------------------------
        // Create NEW notification
        // --------------------------------------------------------

        return await Notification.create({

            recipientId,

            recipientType,

            type,

            title,

            message,

            relatedId,

            dedupeKey,

            isRead: false

        });

    } catch (error) {

        // Duplicate key means another scheduler check
        // already created this notification.

        if (error.code === 11000) {

            return null;

        }

        console.error(
            "Create Notification Error:",
            error
        );

        return null;
    }
};


module.exports = createNotification;