"use client";
import React from "react";

const RecruiterHero = () => {
    return (
        <section style={{ background: "var(--rl-primary)", position: "relative", overflow: "hidden" }}>
            {/* Decorative blobs */}
            <div
                style={{
                    position: "absolute",
                    top: -80,
                    right: -80,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.12)",
                    filter: "blur(80px)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: -60,
                    left: -60,
                    width: 250,
                    height: 250,
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.08)",
                    filter: "blur(60px)",
                }}
            />

            <div className="rl-container" style={{ paddingTop: 80, paddingBottom: 60, position: "relative" }}>
                {/* Hero Content */}
                <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
                    <h1
                        className="rl-heading-1"
                        style={{ color: "#FFFFFF", marginBottom: 20 }}
                    >
                        Build & Ship a Job Board{" "}
                        <span style={{ color: "var(--rl-accent)" }}>Fast</span> with{" "}
                        <span style={{ color: "var(--rl-accent)" }}>HireHeaven</span>
                    </h1>
                    <p
                        className="rl-body"
                        style={{ color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 auto 48px" }}
                    >
                        The all-in-one platform for recruiters to post jobs, discover talent,
                        and build a powerful hiring pipeline — in minutes, not months.
                    </p>
                </div>

                {/* Hero Image */}
                <div
                    style={{
                        maxWidth: 900,
                        margin: "0 auto 40px",
                        borderRadius: "var(--rl-radius-lg)",
                        overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
                        border: "4px solid rgba(255,255,255,0.1)",
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=500&fit=crop&crop=center"
                        alt="Team collaboration meeting"
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />
                </div>

                {/* Brand Logos */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 40,
                        flexWrap: "wrap",
                        opacity: 0.5,
                    }}
                >
                    {["LinkedIn", "Google", "Slack", "Stripe", "Figma", "Notion"].map((brand) => (
                        <span
                            key={brand}
                            style={{
                                color: "#FFFFFF",
                                fontSize: 15,
                                fontWeight: 600,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                            }}
                        >
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecruiterHero;
