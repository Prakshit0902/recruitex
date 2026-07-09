"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "How does HireHeaven help me find the right candidates?",
        a: "HireHeaven uses smart matching algorithms to connect your job postings with the most relevant candidates based on skills, experience, and preferences. Our platform also provides advanced filtering and search capabilities to help you narrow down your ideal candidates quickly.",
    },
    {
        q: "Is there a free plan available for recruiters?",
        a: "Yes! Our free plan allows you to post up to 3 active job listings, access basic candidate search, and manage applications. For unlimited postings and premium features like AI-powered matching and analytics, check out our Pro and Enterprise plans.",
    },
    {
        q: "How long does it take to set up a job board?",
        a: "You can set up your company profile and post your first job in under 15 minutes. Our guided onboarding process walks you through creating your profile, adding team members, and configuring your posting preferences step by step.",
    },
    {
        q: "Can I integrate HireHeaven with my existing HR tools?",
        a: "Absolutely. HireHeaven integrates seamlessly with popular tools like Slack, Google Meet, LinkedIn, Jira, and more. We also provide REST APIs for custom integrations with your existing ATS or HRIS systems.",
    },
    {
        q: "What kind of support do you offer?",
        a: "We offer 24/7 email support for all plans, plus live chat and dedicated account managers for Pro and Enterprise customers. Our help center includes detailed guides, tutorials, and best practices for getting the most out of the platform.",
    },
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="rl-section" style={{ background: "var(--rl-surface)" }}>
            <div className="rl-container" style={{ maxWidth: 720 }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 className="rl-heading-2" style={{ color: "var(--rl-text)", marginBottom: 8 }}>
                        Frequently Asked Questions
                    </h2>
                    <p className="rl-body" style={{ color: "var(--rl-text-muted)" }}>
                        Everything you need to know about HireHeaven
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            style={{
                                borderRadius: "var(--rl-radius)",
                                border: "1px solid var(--rl-border)",
                                overflow: "hidden",
                                background: openIndex === i ? "var(--rl-muted)" : "var(--rl-surface)",
                                transition: "background 0.2s ease",
                            }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                                style={{
                                    width: "100%",
                                    padding: "18px 20px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    textAlign: "left",
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: 15, color: "var(--rl-text)" }}>
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    size={18}
                                    style={{
                                        color: "var(--rl-text-muted)",
                                        flexShrink: 0,
                                        marginLeft: 12,
                                        transition: "transform 0.2s ease",
                                        transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                />
                            </button>
                            <div
                                style={{
                                    maxHeight: openIndex === i ? 300 : 0,
                                    overflow: "hidden",
                                    transition: "max-height 0.3s ease",
                                }}
                            >
                                <p
                                    style={{
                                        padding: "0 20px 18px",
                                        fontSize: 14,
                                        lineHeight: "22px",
                                        color: "var(--rl-text-muted)",
                                    }}
                                >
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
