import React from "react";
import Link from "next/link";

interface BlogCardProps {
    image: string;
    category: string;
    title: string;
    date: string;
    slug?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ image, category, title, date, slug }) => {
    const card = (
        <div className="rl-card" style={{ overflow: "hidden", cursor: slug ? "pointer" : "default" }}>
            <div style={{ overflow: "hidden", height: 180 }}>
                <img
                    src={image}
                    alt={title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
                />
            </div>
            <div style={{ padding: 20 }}>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "var(--rl-radius-pill)",
                        background: "var(--rl-muted)",
                        color: "var(--rl-primary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    {category}
                </span>
                <p
                    style={{
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: "24px",
                        color: "var(--rl-text)",
                        marginTop: 12,
                        marginBottom: 8,
                    }}
                >
                    {title}
                </p>
                <p className="rl-small" style={{ color: "var(--rl-text-muted)" }}>
                    {date}
                </p>
            </div>
        </div>
    );

    if (slug) {
        return (
            <Link href={`/blog/${slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                {card}
            </Link>
        );
    }

    return card;
};

export default BlogCard;
