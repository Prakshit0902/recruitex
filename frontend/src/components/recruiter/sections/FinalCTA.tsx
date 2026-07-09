"use client";
import React from "react";
import { ArrowRight, Briefcase, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";

const FinalCTA = () => {
    return (
        <section
            style={{
                background: "var(--rl-primary)",
                position: "relative",
                overflow: "hidden",
                padding: "80px 24px",
            }}
        >
            {/* Floating decorative icons */}
            <div style={{ position: "absolute", top: 40, left: "10%", opacity: 0.08 }}>
                <Briefcase size={60} style={{ color: "#FFFFFF" }} />
            </div>
            <div style={{ position: "absolute", bottom: 40, right: "10%", opacity: 0.08 }}>
                <Users size={50} style={{ color: "#FFFFFF" }} />
            </div>
            <div style={{ position: "absolute", top: "50%", right: "20%", opacity: 0.06 }}>
                <Sparkles size={40} style={{ color: "#FFFFFF" }} />
            </div>
            <div style={{ position: "absolute", bottom: "30%", left: "15%", opacity: 0.06 }}>
                <Zap size={36} style={{ color: "#FFFFFF" }} />
            </div>

            {/* Decorative blur */}
            <div
                style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.12)",
                    filter: "blur(60px)",
                }}
            />

            <div style={{ textAlign: "center", position: "relative", maxWidth: 600, margin: "0 auto" }}>
                <h2
                    className="rl-heading-2"
                    style={{ color: "#FFFFFF", marginBottom: 16, fontSize: 36 }}
                >
                    Ready to Organize your Hiring?
                </h2>
                <p className="rl-body" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>
                    Join thousands of companies that trust HireHeaven to build their dream teams.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/register">
                        <button className="rl-btn-outline" style={{ padding: "12px 28px", fontSize: 15 }}>
                            Start Free <ArrowRight size={16} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
