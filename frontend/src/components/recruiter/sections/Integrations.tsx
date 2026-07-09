"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

const integrationLogos = [
    "Google Meet", "LinkedIn", "Slack", "Zoom", "Jira", "GitHub",
];

const Integrations = () => {
    return (
        <section className="rl-section" style={{ background: "var(--rl-bg)" }}>
            <div className="rl-container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 24,
                    }}
                    className="rl-integrations-grid"
                >
                    {/* Left — Integration Logos Card */}
                    <div
                        style={{
                            background: "var(--rl-primary)",
                            borderRadius: "var(--rl-radius-lg)",
                            padding: 40,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <h3 className="rl-heading-3" style={{ color: "#FFFFFF", marginBottom: 8 }}>
                            Seamless Integrations
                        </h3>
                        <p className="rl-body" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
                            Connect with the tools your team already uses for a smooth hiring workflow.
                        </p>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 12,
                            }}
                        >
                            {integrationLogos.map((name) => (
                                <div
                                    key={name}
                                    style={{
                                        padding: "14px 12px",
                                        borderRadius: "var(--rl-radius)",
                                        background: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        textAlign: "center",
                                        color: "rgba(255,255,255,0.85)",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — CTA Card */}
                    <div
                        style={{
                            background: "var(--rl-muted)",
                            borderRadius: "var(--rl-radius-lg)",
                            padding: 40,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            border: "1px solid var(--rl-border)",
                        }}
                    >
                        <h3 className="rl-heading-3" style={{ color: "var(--rl-text)", marginBottom: 12 }}>
                            Join to Help Businesses Grow
                        </h3>
                        <p className="rl-body" style={{ color: "var(--rl-text-muted)", marginBottom: 24 }}>
                            Partner with HireHeaven to streamline your hiring, reduce time-to-fill,
                            and connect with top-tier talent across India.
                        </p>
                        <button className="rl-btn-lime" style={{ padding: "12px 28px", fontSize: 15 }}>
                            Get Started <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          .rl-integrations-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </section>
    );
};

export default Integrations;
