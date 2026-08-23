import { useNavigate } from "react-router-dom";
import LandingFooter from "../components/common/LandingFooter";
import ThemeToggle from "../components/common/ThemeToggle";
import "./LandingPage.css";

function LandingPage() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <div className="landing-page">
            <nav className="landing-navbar">
                <button
                    type="button"
                    className="landing-brand"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="FleetRent home"
                >
                    <span className="landing-brand-mark">FR</span>
                    <span>FleetRent</span>
                </button>

                <div className="landing-nav-links">
                    <button type="button" onClick={() => scrollToSection("features")}>
                        Features
                    </button>
                    <button type="button" onClick={() => scrollToSection("how-it-works")}>
                        How it works
                    </button>
                    <button type="button" onClick={() => scrollToSection("roles")}>
                        For drivers & businesses
                    </button>
                </div>

                <div className="landing-nav-actions">
                    <ThemeToggle />
                    <button
                        type="button"
                        className="landing-login-link"
                        onClick={() => navigate("/driver/login")}
                    >
                        Driver Login
                    </button>
                    <button
                        type="button"
                        className="landing-nav-cta"
                        onClick={() => navigate("/business/login")}
                    >
                        Business Login
                    </button>
                </div>
            </nav>

            <main>
                <section className="landing-hero">
                    <div className="landing-hero-content">
                        <div className="landing-badge">
                            <span className="landing-badge-dot" />
                            One platform for everyday fleet operations
                        </div>

                        <h1>
                            Run your fleet
                            <span> with less friction.</span>
                        </h1>

                        <p className="landing-hero-copy">
                            FleetRent brings vehicles, drivers, shifts, assignments,
                            notifications and rent payments together in one simple workspace.
                        </p>

                        <div className="landing-hero-actions">
                            <button
                                type="button"
                                className="landing-primary-button"
                                onClick={() => navigate("/business/register")}
                            >
                                Get started as a business
                                <span>→</span>
                            </button>
                            <button
                                type="button"
                                className="landing-secondary-button"
                                onClick={() => navigate("/driver/register")}
                            >
                                Join as a driver
                            </button>
                        </div>

                        <div className="landing-hero-meta">
                            <span>Vehicle management</span>
                            <span>Driver assignments</span>
                            <span>Shift tracking</span>
                            <span>Rent payments</span>
                        </div>
                    </div>

                    <div className="landing-dashboard-preview" aria-label="FleetRent dashboard preview">
                        <div className="preview-window-bar">
                            <div className="preview-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="preview-window-title">FleetRent Dashboard</span>
                            <span className="preview-status">● Live</span>
                        </div>

                        <div className="preview-body">
                            <aside className="preview-sidebar">
                                <div className="preview-mini-logo">FR</div>
                                <div className="preview-side-line active" />
                                <div className="preview-side-line" />
                                <div className="preview-side-line" />
                                <div className="preview-side-line" />
                                <div className="preview-side-line short" />
                            </aside>

                            <div className="preview-main">
                                <div className="preview-heading-row">
                                    <div>
                                        <span className="preview-eyebrow">FLEET OVERVIEW</span>
                                        <h3>Today's operations</h3>
                                    </div>
                                    <span className="preview-date">Today</span>
                                </div>

                                <div className="preview-stat-grid">
                                    <div className="preview-stat-card">
                                        <span>Active vehicles</span>
                                        <strong>24</strong>
                                        <small>Fleet status</small>
                                    </div>
                                    <div className="preview-stat-card">
                                        <span>Drivers on shift</span>
                                        <strong>18</strong>
                                        <small>Today's schedule</small>
                                    </div>
                                    <div className="preview-stat-card">
                                        <span>Payments due</span>
                                        <strong>₹12.4K</strong>
                                        <small>Pending rent</small>
                                    </div>
                                </div>

                                <div className="preview-activity-card">
                                    <div className="preview-card-heading">
                                        <span>Recent activity</span>
                                        <span>View all</span>
                                    </div>
                                    <div className="preview-activity-row">
                                        <span className="preview-avatar">AK</span>
                                        <div>
                                            <strong>Shift started</strong>
                                            <small>Vehicle MH 02 AB 1234</small>
                                        </div>
                                        <em>09:12 AM</em>
                                    </div>
                                    <div className="preview-activity-row">
                                        <span className="preview-avatar alt">RS</span>
                                        <div>
                                            <strong>Payment recorded</strong>
                                            <small>Daily rent payment</small>
                                        </div>
                                        <em>08:46 AM</em>
                                    </div>
                                    <div className="preview-activity-row">
                                        <span className="preview-avatar warm">PM</span>
                                        <div>
                                            <strong>Driver assigned</strong>
                                            <small>Vehicle MH 01 CD 5678</small>
                                        </div>
                                        <em>08:20 AM</em>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-trust-strip">
                    <span>Built for the daily fleet workflow</span>
                    <div>
                        <span>Vehicles</span>
                        <i>•</i>
                        <span>Drivers</span>
                        <i>•</i>
                        <span>Shifts</span>
                        <i>•</i>
                        <span>Payments</span>
                        <i>•</i>
                        <span>Notifications</span>
                    </div>
                </section>

                <section id="features" className="landing-section landing-features">
                    <div className="landing-section-heading">
                        <span className="landing-eyebrow">CORE FEATURES</span>
                        <h2>Everything your fleet needs, in one place.</h2>
                        <p>
                            Keep the important operational work connected instead of managing
                            every part of the fleet separately.
                        </p>
                    </div>

                    <div className="landing-feature-grid">
                        <article className="landing-feature-card featured">
                            <div className="feature-icon">01</div>
                            <h3>Vehicle management</h3>
                            <p>
                                Keep vehicle details, documents, availability and fleet status
                                organised for quick access.
                            </p>
                            <span>Fleet visibility →</span>
                        </article>

                        <article className="landing-feature-card">
                            <div className="feature-icon">02</div>
                            <h3>Driver assignments</h3>
                            <p>
                                Connect drivers with vehicles and keep assignment information
                                available to the business team.
                            </p>
                            <span>Simple assignment flow →</span>
                        </article>

                        <article className="landing-feature-card">
                            <div className="feature-icon">03</div>
                            <h3>Shift management</h3>
                            <p>
                                Track shift activity, status changes, day-off reports and recent
                                operational history.
                            </p>
                            <span>Stay on schedule →</span>
                        </article>

                        <article className="landing-feature-card">
                            <div className="feature-icon">04</div>
                            <h3>Rent payments</h3>
                            <p>
                                Keep daily rent payment information visible and support online
                                payment flows for drivers.
                            </p>
                            <span>Payment tracking →</span>
                        </article>

                        <article className="landing-feature-card">
                            <div className="feature-icon">05</div>
                            <h3>Notifications</h3>
                            <p>
                                Surface important shift and operational updates so users can act
                                without searching through the application.
                            </p>
                            <span>Important updates →</span>
                        </article>

                        <article className="landing-feature-card">
                            <div className="feature-icon">06</div>
                            <h3>Role-based access</h3>
                            <p>
                                Separate driver and business workflows so each user sees the tools
                                relevant to their role.
                            </p>
                            <span>Focused experience →</span>
                        </article>
                    </div>
                </section>

                <section id="how-it-works" className="landing-section landing-workflow">
                    <div className="landing-section-heading compact">
                        <span className="landing-eyebrow">HOW IT WORKS</span>
                        <h2>From sign-up to daily operations.</h2>
                        <p>Keep the workflow straightforward for both sides of the platform.</p>
                    </div>

                    <div className="landing-steps">
                        <div className="landing-step">
                            <span className="step-number">01</span>
                            <div>
                                <h3>Create your account</h3>
                                <p>Choose a driver or business account and complete registration.</p>
                            </div>
                        </div>
                        <div className="landing-step">
                            <span className="step-number">02</span>
                            <div>
                                <h3>Set up the fleet</h3>
                                <p>Businesses can manage vehicles, drivers and assignments from one place.</p>
                            </div>
                        </div>
                        <div className="landing-step">
                            <span className="step-number">03</span>
                            <div>
                                <h3>Run daily shifts</h3>
                                <p>Drivers manage their assigned work while businesses track operations.</p>
                            </div>
                        </div>
                        <div className="landing-step">
                            <span className="step-number">04</span>
                            <div>
                                <h3>Track payments</h3>
                                <p>Keep rent payment activity connected to the rest of the workflow.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="roles" className="landing-role-section">
                    <div className="landing-role-intro">
                        <span className="landing-eyebrow">BUILT FOR BOTH SIDES</span>
                        <h2>One platform. Two focused experiences.</h2>
                        <p>
                            FleetRent keeps the business and driver workflows connected while
                            giving each role its own dedicated tools.
                        </p>
                    </div>

                    <div className="landing-role-grid">
                        <article className="landing-role-card driver">
                            <div className="role-card-top">
                                <span className="role-label">DRIVER</span>
                                <span className="role-arrow">↗</span>
                            </div>
                            <h3>Focus on your shift.</h3>
                            <p>
                                View your assignment, manage shift activity, check payment status
                                and keep track of your history.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/driver/login")}
                            >
                                Driver Login
                            </button>
                        </article>

                        <article className="landing-role-card business">
                            <div className="role-card-top">
                                <span className="role-label">BUSINESS</span>
                                <span className="role-arrow">↗</span>
                            </div>
                            <h3>Keep the fleet moving.</h3>
                            <p>
                                Manage vehicles, assignments, shifts, payments and notifications
                                from a business-focused dashboard.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/business/login")}
                            >
                                Business Login
                            </button>
                        </article>
                    </div>
                </section>

                <section className="landing-final-cta">
                    <div>
                        <span className="landing-eyebrow">GET STARTED</span>
                        <h2>Make fleet operations easier to manage.</h2>
                        <p>Choose your account type and start using FleetRent.</p>
                    </div>
                    <div className="landing-final-actions">
                        <button
                            type="button"
                            className="landing-primary-button"
                            onClick={() => navigate("/business/register")}
                        >
                            Register as Business
                            <span>→</span>
                        </button>
                        <button
                            type="button"
                            className="landing-final-link"
                            onClick={() => navigate("/driver/register")}
                        >
                            Register as Driver
                        </button>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

export default LandingPage;
