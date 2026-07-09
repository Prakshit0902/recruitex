import React from "react";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";

interface JobCardProps {
    logo: string;
    company: string;
    title: string;
    location: string;
    type: string;
    tags: string[];
}

const JobCard: React.FC<JobCardProps> = ({ logo, company, title, location, type, tags }) => {
    return (
        <div className="rl-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <img
                    src={logo}
                    alt={company}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--rl-radius)",
                        objectFit: "cover",
                        border: "1px solid var(--rl-border)",
                    }}
                />
                <div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: "var(--rl-text)" }}>{title}</p>
                    <p className="rl-small" style={{ color: "var(--rl-text-muted)" }}>{company}</p>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <span className="rl-small" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--rl-text-muted)" }}>
                    <MapPin size={14} /> {location}
                </span>
                <span className="rl-small" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--rl-text-muted)" }}>
                    <Briefcase size={14} /> {type}
                </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {tags.map((tag) => (
                    <span
                        key={tag}
                        style={{
                            fontSize: 12,
                            padding: "4px 10px",
                            borderRadius: "var(--rl-radius-pill)",
                            background: "var(--rl-muted)",
                            color: "var(--rl-text-muted)",
                            fontWeight: 500,
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <button className="rl-btn-outline-dark" style={{ width: "100%", fontSize: 13 }}>
                Apply Now <ArrowRight size={14} />
            </button>
        </div>
    );
};

export default JobCard;
