"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Menu, X, Search, User, ChevronDown, LogOut, LayoutDashboard, FileText } from "lucide-react"
import ThemeSwitcher from "./ThemeSwitcher"
import AuthModal from "./AuthModal"
import { useAuth } from "@/lib/auth-context"

const navLinks = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  {
    label: "Resources",
    href: "#",
    children: ["Career Advice", "Salary Guide", "Blog"],
  },
]

function NavDot() {
  return (
    <span className="hidden lg:inline-block size-1 rounded-full bg-border mx-0.5" />
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin")
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openSignIn = () => { setAuthTab("signin"); setAuthOpen(true) }
  const openSignUp = () => { setAuthTab("signup"); setAuthOpen(true) }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:pt-5">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      <motion.div
        className="mx-auto max-w-5xl"
        animate={{ scale: scrolled ? 0.97 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="relative rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-lg shadow-primary/5 h-14 sm:h-16 px-4 sm:px-5 flex items-center justify-between">
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `conic-gradient(from var(--border-angle), color-mix(in oklch, var(--primary) 20%, transparent), color-mix(in oklch, var(--accent-brand) 15%, transparent), color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--accent-brand) 20%, transparent), color-mix(in oklch, var(--primary) 20%, transparent))`,
              animation: "rotate-border 6s linear infinite",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />

          <Link href="/" className="relative flex items-center gap-2.5 shrink-0 group">
            <motion.div
              className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-brand-400 shadow-md shadow-primary/20"
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
            >
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                Rx
              </span>
            </motion.div>
            <span className="hidden sm:inline text-base font-extrabold tracking-tight">
              <span className="bg-linear-to-r from-primary to-brand-400 bg-clip-text text-transparent">
                Recruite
              </span>
              <span className="text-accent-brand">X</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5 relative">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative group">
                  <button className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                    <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 rounded-xl border border-border/50 bg-card/90 backdrop-blur-xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg">
                    {link.children.map((child) => (
                      <Link
                        key={child}
                        href="#"
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {child}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/30 group"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-primary group-hover:w-3/5 transition-all duration-300"
                  />
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 relative">
            <ThemeSwitcher />

            <NavDot />

            <button className="hidden sm:flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Search size={15} />
            </button>

            <NavDot />

            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/dashboard" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Dashboard">
                  <LayoutDashboard size={14} />
                </Link>
                <Link href="/applications" className="hidden sm:flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Applications">
                  <FileText size={14} />
                </Link>
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-foreground">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex gap-1.5 rounded-full px-3.5 text-sm"
                  onClick={openSignIn}
                >
                  <User size={14} />
                  Sign In
                </Button>

                <Button
                  size="sm"
                  className="hidden sm:inline-flex rounded-full px-4 text-sm shadow-sm gap-1.5"
                  onClick={openSignUp}
                >
                  Join Free
                </Button>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden mx-auto max-w-sm mt-2 rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="p-2 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-1.5 border-border/50 mx-2" />
              <div className="flex items-center gap-2 px-4 py-2">
                {user ? (
                  <Button size="sm" className="flex-1 gap-1.5 rounded-full" onClick={logout}>
                    <LogOut size={14} />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1 gap-1.5 rounded-full" onClick={() => { openSignIn(); setMobileOpen(false) }}>
                      <User size={14} />
                      Sign In
                    </Button>
                    <Button size="sm" className="flex-1 gap-1.5 rounded-full" onClick={() => { openSignUp(); setMobileOpen(false) }}>
                      Join Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
