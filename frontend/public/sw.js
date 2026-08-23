self.addEventListener("push", (event) => {

    if (!event.data) {
        return;
    }

    let data;

    try {
        data = event.data.json();
    } catch (error) {

        data = {
            title: "FleetRent",
            message: event.data.text()
        };

    }


    const title =
        data.title || "FleetRent";


    const options = {

        body:
            data.message ||
            "You have a new notification.",

        icon:
            "/favicon.ico",

        badge:
            "/favicon.ico",

        data: {
            url:
                data.url ||
                "/driver/dashboard"
        }

    };


    event.waitUntil(

        self.registration.showNotification(
            title,
            options
        )

    );

});


// ============================================================
// WHEN DRIVER CLICKS NOTIFICATION
// ============================================================

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();


        const url =
            event.notification.data?.url ||
            "/driver/dashboard";


        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then((clientList) => {

                for (
                    const client of clientList
                ) {

                    if (
                        "focus" in client
                    ) {

                        client.navigate(url);

                        return client.focus();

                    }

                }


                if (
                    clients.openWindow
                ) {

                    return clients.openWindow(
                        url
                    );

                }

            })

        );

    }
);