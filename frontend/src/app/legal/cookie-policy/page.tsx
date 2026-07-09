import React from "react";

export const metadata = {
    title: "Cookie Policy - HireHeaven",
    description: "HireHeaven Cookie Policy - How we use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
    const headingStyle: React.CSSProperties = { fontSize: 20, fontWeight: 600, color: "#0F172A", marginTop: 32, marginBottom: 12 };
    const paraStyle: React.CSSProperties = { fontSize: 15, lineHeight: "26px", color: "#4B5563", marginBottom: 16 };

    return (
        <>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Legal
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Cookie Policy</h1>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 32 }}>Last updated: February 22, 2025</p>

            <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", marginBottom: 32 }} />

            <p style={paraStyle}>
                This Cookie Policy explains how HireHeaven uses cookies and similar technologies to recognize you when you
                visit our platform. It explains what these technologies are and why we use them, as well as your rights to
                control our use of them.
            </p>

            <h2 style={headingStyle}>1. What Are Cookies?</h2>
            <p style={paraStyle}>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work efficiently, remember your preferences, and provide reporting information.
            </p>

            <h2 style={headingStyle}>2. Types of Cookies We Use</h2>

            <h3 style={{ ...headingStyle, fontSize: 17, marginTop: 20 }}>Essential Cookies</h3>
            <p style={paraStyle}>
                These cookies are strictly necessary for the platform to function. They include authentication tokens
                (JWT stored in cookies) that keep you signed in, session management, and security features. You cannot
                opt out of these cookies.
            </p>

            <h3 style={{ ...headingStyle, fontSize: 17, marginTop: 20 }}>Functional Cookies</h3>
            <p style={paraStyle}>
                These cookies enable enhanced functionality and personalization, such as remembering your preferences,
                language settings, and display options. They may be set by us or by third-party providers.
            </p>

            <h3 style={{ ...headingStyle, fontSize: 17, marginTop: 20 }}>Analytics Cookies</h3>
            <p style={paraStyle}>
                These cookies help us understand how visitors interact with our platform by collecting and reporting
                information anonymously. This helps us improve the user experience and platform performance.
            </p>

            <h2 style={headingStyle}>3. Specific Cookies We Use</h2>
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                            <th style={{ textAlign: "left", padding: "10px 12px", color: "#0F172A", fontWeight: 600 }}>Cookie Name</th>
                            <th style={{ textAlign: "left", padding: "10px 12px", color: "#0F172A", fontWeight: 600 }}>Type</th>
                            <th style={{ textAlign: "left", padding: "10px 12px", color: "#0F172A", fontWeight: 600 }}>Purpose</th>
                            <th style={{ textAlign: "left", padding: "10px 12px", color: "#0F172A", fontWeight: 600 }}>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "10px 12px", color: "#4B5563", fontFamily: "monospace" }}>token</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>Essential</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>Authentication &amp; session management</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>7 days</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "10px 12px", color: "#4B5563", fontFamily: "monospace" }}>user_prefs</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>Functional</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>User preference storage</td>
                            <td style={{ padding: "10px 12px", color: "#4B5563" }}>30 days</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 style={headingStyle}>4. How to Control Cookies</h2>
            <p style={paraStyle}>
                You can control and manage cookies in several ways. Most browsers allow you to refuse or accept cookies,
                delete existing cookies, and set preferences for certain websites. Please note that disabling essential
                cookies may affect the functionality of the platform.
            </p>
            <ul style={{ ...paraStyle, paddingLeft: 24 }}>
                <li style={{ marginBottom: 8 }}><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies through the settings menu.</li>
                <li style={{ marginBottom: 8 }}><strong>Opt-Out:</strong> For analytics cookies, you can opt out through your browser&apos;s privacy settings.</li>
            </ul>

            <h2 style={headingStyle}>5. Updates to This Policy</h2>
            <p style={paraStyle}>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
                revision date.
            </p>

            <h2 style={headingStyle}>6. Contact Us</h2>
            <p style={paraStyle}>
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:contact@hireheaven.com" style={{ color: "#3B82F6" }}>contact@hireheaven.com</a>.
            </p>
        </>
    );
}
