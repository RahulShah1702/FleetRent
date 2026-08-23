import { Link } from "react-router-dom";
import "./LandingFooter.css";

function LandingFooter() {
    return (
        <footer className="landing-footer">
            <div className="landing-footer-main">
                <div className="landing-footer-brand">
                    <Link to="/" className="landing-footer-logo">
                        <span className="landing-footer-mark">FR</span>
                        <span>FleetRent</span>
                    </Link>

                    <p className="landing-footer-tagline">
                        Fleet management made simple.
                    </p>
                    <p>
                        Manage vehicles, drivers, shifts and payments from one connected workspace.
                    </p>
                </div>

                <div className="landing-footer-column">
                    <h3>Platform</h3>
                    <Link to="/">Home</Link>
                    <Link to="/driver/login">Driver Login</Link>
                    <Link to="/driver/register">Driver Register</Link>
                    <Link to="/business/login">Business Login</Link>
                    <Link to="/business/register">Business Register</Link>
                </div>

                <div className="landing-footer-column">
                    <h3>Features</h3>
                    <a href="#features">Vehicle Management</a>
                    <a href="#features">Driver Assignments</a>
                    <a href="#how-it-works">Shift Management</a>
                    <a href="#features">Rent Payments</a>
                    <a href="#features">Notifications</a>
                </div>

                <div className="landing-footer-column">
                    <h3>Support</h3>
                    <a href="mailto:support@fleetrent.com">Contact Support</a>
                    <span>Help Center</span>
                    <span>Privacy Policy</span>
                    <span>Terms &amp; Conditions</span>
                </div>
            </div>

            <div className="landing-footer-bottom">
                <span>© 2026 FleetRent. All rights reserved.</span>
                <span>Built during internship at Talking Crooks IT Pvt. Ltd.</span>
                <span>Developed by Rahul Shah</span>
            </div>
        </footer>
    );
}

export default LandingFooter;
