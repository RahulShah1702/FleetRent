import "./AppFooter.css";

function AppFooter({
    section = ""
}) {

    return (
        <footer className="app-footer">

            <div className="app-footer-brand">

                <strong>
                    FleetRent
                </strong>

                <span>
                    Fleet management made simple
                </span>

            </div>


            <div className="app-footer-meta">

                <span>
                    © 2026 FleetRent
                </span>

                {section && (
                    <>
                        <span className="app-footer-divider">
                            •
                        </span>

                        <span>
                            {section}
                        </span>
                    </>
                )}

            </div>

        </footer>
    );
}

export default AppFooter;