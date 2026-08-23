const webpush =
    require("web-push");


webpush.setVapidDetails(

    process.env.VAPID_SUBJECT,

    process.env.VAPID_PUBLIC_KEY,

    process.env.VAPID_PRIVATE_KEY

);


const sendPushNotification =
    async (
        subscription,
        payload
    ) => {

        try {

            await webpush.sendNotification(

                subscription,

                JSON.stringify(payload)

            );

            return {
                success: true
            };

        } catch (error) {

            console.error(
                "Web Push Error:",
                error.statusCode,
                error.message
            );


            return {
                success: false,

                statusCode:
                    error.statusCode
            };

        }

    };


module.exports =
    sendPushNotification;