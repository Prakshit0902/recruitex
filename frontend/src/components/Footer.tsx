"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Globe, MessageCircle, AtSign, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "For Recruiters",
    links: [
      { label: "Post a Job", href: "/jobs" },
      { label: "Recruiter Suite", href: "/dashboard" },
      { label: "Company Profile", href: "/companies" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "My Profile", href: "/profile" },
      { label: "Applications", href: "/applications" },
      { label: "Reset Password", href: "/reset-password" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="text-xl font-extrabold tracking-tight">
                <span className="bg-linear-to-r from-primary to-brand-400 bg-clip-text text-transparent">
                  Recruite
                </span>
                <span className="text-accent-brand">X</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Connecting talent with opportunity. The intelligent platform for modern hiring and career growth.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Globe, MessageCircle, AtSign, ExternalLink].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex size-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  aria-label={`Social link ${i + 1}`}
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RecruiteX. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Stay updated</span>
            <div className="flex items-center gap-1">
              <input
                type="email"
                placeholder="Your email"
                className="h-8 rounded-lg border border-border/50 bg-background px-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 w-36"
              />
              <Button size="icon-xs" className="shrink-0">
                <ArrowRight size={12} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
