import api from "../services/api";


// ============================================================
// CONVERT VAPID PUBLIC KEY
// ============================================================

const urlBase64ToUint8Array = (
    base64String
) => {

    const padding =
        "=".repeat(
            (4 -
                base64String.length % 4
            ) % 4
        );

    const base64 =
        (
            base64String +
            padding
        )
        .replace(
            /-/g,
            "+"
        )
        .replace(
            /_/g,
            "/"
        );


    const rawData =
        window.atob(base64);


    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );

};


// ============================================================
// ENABLE PUSH NOTIFICATIONS
// ============================================================

export const enablePushNotifications =
    async () => {

        try {

            if (
                !("serviceWorker" in navigator)
            ) {

                console.log(
                    "Service workers are not supported."
                );

                return false;
            }


            if (
                !("PushManager" in window)
            ) {

                console.log(
                    "Push notifications are not supported."
                );

                return false;
            }


            // ------------------------------------------------
            // Request permission
            // ------------------------------------------------

            const permission =
                await Notification.requestPermission();


            if (
                permission !== "granted"
            ) {

                console.log(
                    "Notification permission denied."
                );

                return false;
            }


            // ------------------------------------------------
            // Register service worker
            // ------------------------------------------------

            const registration =
                await navigator.serviceWorker.register(
                    "/sw.js"
                );


            // ------------------------------------------------
            // Get VAPID public key
            // ------------------------------------------------

            const publicKey =
                import.meta.env
                    .VITE_VAPID_PUBLIC_KEY;


            if (!publicKey) {

                console.error(
                    "VITE_VAPID_PUBLIC_KEY is missing."
                );

                return false;
            }


            // ------------------------------------------------
            // Get existing subscription
            // ------------------------------------------------

            let subscription =
                await registration.pushManager.getSubscription();


            // ------------------------------------------------
            // Create subscription
            // ------------------------------------------------

            if (!subscription) {

                subscription =
                    await registration.pushManager.subscribe({

                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                publicKey
                            )

                    });

            }


            // ------------------------------------------------
            // Send subscription to backend
            // ------------------------------------------------

            await api.post(
                "/notifications/push/subscribe",
                subscription.toJSON()
            );


            console.log(
                "Push notifications enabled."
            );


            return true;

        } catch (error) {

            console.error(
                "Enable Push Notifications Error:",
                error
            );

            return false;

        }

    };