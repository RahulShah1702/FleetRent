import { useEffect, useRef } from "react";


function GoogleButton({ onCredential }) {

    const buttonRef = useRef(null);


    useEffect(() => {

        const initializeGoogle = () => {

            if (!window.google) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id:
                    import.meta.env.VITE_GOOGLE_CLIENT_ID,

                callback: onCredential
            });


            window.google.accounts.id.renderButton(
                buttonRef.current,
                {
                    theme: "outline",
                    size: "large",
                    width: 350,
                    text: "continue_with"
                }
            );
        };


        if (window.google) {

            initializeGoogle();

        } else {

            const interval =
                setInterval(() => {

                    if (window.google) {

                        clearInterval(interval);

                        initializeGoogle();
                    }

                }, 100);

            return () =>
                clearInterval(interval);
        }

    }, [onCredential]);


    return (
        <div
            ref={buttonRef}
            style={{
                display: "flex",
                justifyContent: "center"
            }}
        />
    );
}


export default GoogleButton;