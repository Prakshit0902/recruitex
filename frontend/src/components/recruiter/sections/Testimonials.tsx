"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import TestimonialCard from "../TestimonialCard";

const testimonials = [
    {
        quote:
            "HireHeaven transformed our hiring process. We went from spending weeks screening candidates to finding perfect matches in days. The platform is incredibly intuitive.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
        name: "Rajesh Kumar",
        role: "CTO, TechWave Inc.",
    },
    {
        quote:
            "As a startup, we needed to hire fast without sacrificing quality. HireHeaven gave us access to a talent pool we couldn't have found on our own. Highly recommend!",
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face",
        name: "Anita Desai",
        role: "Head of HR, CloudLift",
    },
    {
        quote:
            "The analytics and candidate tracking features are best-in-class. We've reduced our time-to-hire by 60% since switching to HireHeaven. It's a game-changer.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
        name: "Sanjay Verma",
        role: "Founder, DataSync",
    },
];

const Testimonials = () => {
    return (
        <section
            className="rl-section"
            style={{ background: "var(--rl-muted)", position: "relative", overflow: "hidden" }}
        >
            {/* Decorative blob */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.12)",
                    filter: "blur(100px)",
                    pointerEvents: "none",
                }}
            />

            <div className="rl-container" style={{ position: "relative" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 className="rl-heading-2" style={{ color: "var(--rl-text)", marginBottom: 16 }}>
                        What Our Clients Say
                    </h2>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 24,
                    }}
                    className="rl-testimonials-grid"
                >
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} {...t} />
                    ))}
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          .rl-testimonials-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </section>
    );
};

export default Testimonials;
