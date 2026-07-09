"use client";
import React from "react";
import { UserPlus, FileText, Briefcase, CheckCircle } from "lucide-react";

const steps = [
    {
        icon: UserPlus,
        title: "Create Account",
        desc: "Sign up as a recruiter in under 2 minutes. No credit card required.",
    },
    {
        icon: FileText,
        title: "Complete Profile",
        desc: "Set up your company profile, add team members, and configure your hiring preferences.",
    },
    {
        icon: Briefcase,
        title: "Post Jobs & Hire",
        desc: "Publish your first job listing and start receiving quality applications immediately.",
    },
];

const stats = [
    { value: "45k+", label: "Positions Filled" },
    { value: "15min", label: "Avg. Time to Post" },
    { value: "2000+", label: "Companies Hiring" },
];

const HowItWorks = () => {
    return (
        <section className="rl-section" style={{ background: "var(--rl-surface)" }}>
            <div className="rl-container">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 60,
                        alignItems: "center",
                    }}
                    className="rl-two-col"
                >
                    {/* Left Column */}
                    <div>
                        <h2 className="rl-heading-2" style={{ marginBottom: 8, color: "var(--rl-text)" }}>
                            Get Things Done with{" "}
                            <span style={{ color: "var(--rl-primary)" }}>Minimal Effort</span>
                        </h2>
                        <p className="rl-body" style={{ color: "var(--rl-text-muted)", marginBottom: 32 }}>
                            Our streamlined process makes hiring effortless from day one.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {steps.map((step, i) => (
                                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "var(--rl-radius)",
                                            background: i === 0 ? "var(--rl-accent)" : "var(--rl-muted)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <step.icon size={22} style={{ color: "var(--rl-primary)" }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 16, color: "var(--rl-text)", marginBottom: 4 }}>
                                            {step.title}
                                        </p>
                                        <p className="rl-small" style={{ color: "var(--rl-text-muted)" }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column — Image Card */}
                    <div
                        style={{
                            borderRadius: "var(--rl-radius-lg)",
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "var(--rl-shadow)",
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=500&fit=crop&crop=center"
                            alt="Team working together"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(135deg, rgba(11,37,69,0.15), rgba(11,37,69,0.05))",
                            }}
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 60,
                        marginTop: 60,
                        flexWrap: "wrap",
                    }}
                >
                    {stats.map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 36, fontWeight: 800, color: "var(--rl-primary)", lineHeight: 1 }}>
                                {s.value}
                            </p>
                            <p className="rl-small" style={{ color: "var(--rl-text-muted)", marginTop: 6 }}>
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          .rl-two-col {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
        </section>
    );
};

export default HowItWorks;
