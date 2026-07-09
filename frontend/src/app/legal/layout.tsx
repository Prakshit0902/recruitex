import React from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
            {/* Header */}
            <header
                style={{
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E5E7EB",
                    padding: "16px 0",
                }}
            >
                <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <nav style={{ display: "flex", gap: 24, fontSize: 14 }}>
                        <Link href="/legal/privacy-policy" style={{ color: "#6B7280", textDecoration: "none" }}>Privacy</Link>
                        <Link href="/legal/terms-of-service" style={{ color: "#6B7280", textDecoration: "none" }}>Terms</Link>
                        <Link href="/legal/cookie-policy" style={{ color: "#6B7280", textDecoration: "none" }}>Cookies</Link>
                        <Link href="/legal/gdpr" style={{ color: "#6B7280", textDecoration: "none" }}>GDPR</Link>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
                <div
                    style={{
                        background: "#FFFFFF",
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        padding: "48px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}
