import React from "react";

interface TestimonialCardProps {
    quote: string;
    avatar: string;
    name: string;
    role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, avatar, name, role }) => {
    return (
        <div className="rl-card" style={{ padding: 24 }}>
            <p
                style={{
                    fontSize: 15,
                    lineHeight: "24px",
                    color: "var(--rl-text)",
                    marginBottom: 20,
                    fontStyle: "italic",
                    opacity: 0.85,
                }}
            >
                &ldquo;{quote}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                    src={avatar}
                    alt={name}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
                <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "var(--rl-text)" }}>{name}</p>
                    <p style={{ fontSize: 13, color: "var(--rl-text-muted)" }}>{role}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
