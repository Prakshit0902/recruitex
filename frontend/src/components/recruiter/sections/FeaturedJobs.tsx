"use client";
import React from "react";
import { Search, ArrowRight } from "lucide-react";
import JobCard from "../JobCard";

const jobsData = [
    {
        logo: "https://ui-avatars.com/api/?name=TW&background=1DA1F2&color=fff&rounded=true&size=44",
        company: "TechWave Inc.",
        title: "Senior Frontend Developer",
        location: "Bangalore, IN",
        type: "Full-time",
        tags: ["React", "TypeScript", "Remote"],
    },
    {
        logo: "https://ui-avatars.com/api/?name=DS&background=0B3D2E&color=C6F94B&rounded=true&size=44",
        company: "DataSync",
        title: "DevOps Engineer",
        location: "Mumbai, IN",
        type: "Full-time",
        tags: ["AWS", "Kubernetes", "CI/CD"],
    },
    {
        logo: "https://ui-avatars.com/api/?name=CL&background=6366F1&color=fff&rounded=true&size=44",
        company: "CloudLift",
        title: "Product Designer",
        location: "Remote",
        type: "Contract",
        tags: ["Figma", "UI/UX", "Design Systems"],
    },
    {
        logo: "https://ui-avatars.com/api/?name=NX&background=EC4899&color=fff&rounded=true&size=44",
        company: "NexGen AI",
        title: "ML Engineer",
        location: "Hyderabad, IN",
        type: "Full-time",
        tags: ["Python", "PyTorch", "LLMs"],
    },
    {
        logo: "https://ui-avatars.com/api/?name=FP&background=F59E0B&color=fff&rounded=true&size=44",
        company: "FinPay",
        title: "Backend Developer",
        location: "Pune, IN",
        type: "Full-time",
        tags: ["Node.js", "PostgreSQL", "API"],
    },
    {
        logo: "https://ui-avatars.com/api/?name=GH&background=10B981&color=fff&rounded=true&size=44",
        company: "GreenHub",
        title: "Marketing Manager",
        location: "Delhi, IN",
        type: "Full-time",
        tags: ["SEO", "Content", "Analytics"],
    },
];

const FeaturedJobs = () => {
    return (
        <section className="rl-section" style={{ background: "var(--rl-bg)" }}>
            <div className="rl-container">
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 className="rl-heading-2" style={{ color: "var(--rl-text)", marginBottom: 8 }}>
                        Featured Job Circulars
                    </h2>
                    <p className="rl-body" style={{ color: "var(--rl-text-muted)" }}>
                        Discover the latest opportunities from top companies
                    </p>
                </div>

                {/* Search + Filter Row */}
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 32,
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minWidth: 240,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            borderRadius: "var(--rl-radius-pill)",
                            border: "1px solid var(--rl-border)",
                            background: "var(--rl-surface)",
                        }}
                    >
                        <Search size={16} style={{ color: "var(--rl-text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            style={{
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                fontSize: 14,
                                color: "var(--rl-text)",
                                width: "100%",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                    <select
                        style={{
                            padding: "10px 16px",
                            borderRadius: "var(--rl-radius-pill)",
                            border: "1px solid var(--rl-border)",
                            background: "var(--rl-surface)",
                            fontSize: 14,
                            color: "var(--rl-text)",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        <option>All Types</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Remote</option>
                    </select>
                </div>

                {/* Jobs Grid + Sidebar */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 300px",
                        gap: 24,
                    }}
                    className="rl-jobs-grid"
                >
                    {/* Job Cards Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {jobsData.map((job, i) => (
                            <JobCard key={i} {...job} />
                        ))}
                    </div>

                    {/* Sidebar CTA */}
                    <div
                        style={{
                            background: "var(--rl-primary)",
                            borderRadius: "var(--rl-radius-lg)",
                            padding: 28,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            gap: 16,
                            alignSelf: "start",
                            position: "sticky",
                            top: 100,
                        }}
                    >
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", lineHeight: "28px" }}>
                            Ready to hire top talent?
                        </p>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: "22px" }}>
                            Post your first job for free and reach thousands of qualified candidates.
                        </p>
                        <button className="rl-btn-lime" style={{ marginTop: 8 }}>
                            Post a Job <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Load More */}
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    <button className="rl-btn-lime" style={{ padding: "12px 40px", fontSize: 15 }}>
                        Load More Jobs <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 1024px) {
          .rl-jobs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </section>
    );
};

export default FeaturedJobs;
