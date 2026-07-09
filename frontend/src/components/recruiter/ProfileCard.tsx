import React from "react";

interface ProfileCardProps {
    avatar: string;
    name: string;
    role: string;
    company: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ avatar, name, role, company }) => {
    return (
        <div className="rl-card" style={{ padding: 24, textAlign: "center" }}>
            <img
                src={avatar}
                alt={name}
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 12px",
                    border: "3px solid var(--rl-muted)",
                }}
            />
            <p style={{ fontWeight: 600, fontSize: 16, color: "var(--rl-text)", marginBottom: 4 }}>{name}</p>
            <p className="rl-small" style={{ color: "var(--rl-text-muted)", marginBottom: 2 }}>{role}</p>
            <p className="rl-small" style={{ color: "var(--rl-primary)", fontWeight: 500 }}>{company}</p>
        </div>
    );
};

export default ProfileCard;
