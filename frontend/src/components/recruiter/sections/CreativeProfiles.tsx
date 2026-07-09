"use client";
import React from "react";
import ProfileCard from "../ProfileCard";

const profiles = [
    {
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        name: "Arjun Mehta",
        role: "Full Stack Developer",
        company: "TechWave Inc.",
    },
    {
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        name: "Priya Sharma",
        role: "UX Designer",
        company: "CloudLift",
    },
    {
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        name: "Rahul Gupta",
        role: "Data Scientist",
        company: "NexGen AI",
    },
    {
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        name: "Sneha Patel",
        role: "Product Manager",
        company: "FinPay",
    },
    {
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        name: "Vikram Singh",
        role: "DevOps Engineer",
        company: "DataSync",
    },
];

const CreativeProfiles = () => {
    return (
        <section className="rl-section" style={{ background: "var(--rl-surface)" }}>
            <div className="rl-container">
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 className="rl-heading-2" style={{ color: "var(--rl-text)", marginBottom: 8 }}>
                        Top Creative Profiles
                    </h2>
                    <p className="rl-body" style={{ color: "var(--rl-text-muted)" }}>
                        Meet the talented professionals on our platform
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 20,
                    }}
                    className="rl-profiles-grid"
                >
                    {profiles.map((p, i) => (
                        <ProfileCard key={i} {...p} />
                    ))}
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 1024px) {
          .rl-profiles-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .rl-profiles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
        </section>
    );
};

export default CreativeProfiles;
