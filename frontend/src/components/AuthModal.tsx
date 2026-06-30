"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Briefcase, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import type { LoginInput, RegisterInput } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Tab = "signin" | "signup"
type Role = "jobseeker" | "recruiter"

const roles: { value: Role; label: string }[] = [
  { value: "jobseeker", label: "Job Seeker" },
  { value: "recruiter", label: "Recruiter" },
]

interface AuthModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: Tab
}

export default function AuthModal({ open, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()

  const [loginForm, setLoginForm] = useState<LoginInput>({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState<RegisterInput>({
    name: "", email: "", password: "", phoneNumber: "", role: "jobseeker", bio: "",
  })

  const resetForms = () => {
    setLoginForm({ email: "", password: "" })
    setRegisterForm({ name: "", email: "", password: "", phoneNumber: "", role: "jobseeker", bio: "" })
    setError("")
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      await login(loginForm)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const { name, email, password, phoneNumber, bio } = registerForm
    if (!name || !email || !password || !phoneNumber || !bio) {
      setError("Please fill in all fields")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    try {
      await register(registerForm)
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 pt-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-brand-400">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <span className="font-extrabold tracking-tight">
                    <span className="bg-linear-to-r from-primary to-brand-400 bg-clip-text text-transparent">
                      Recruite
                    </span>
                    <span className="text-accent-brand">X</span>
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex rounded-xl bg-muted/50 p-0.5">
                {(["signin", "signup"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError("") }}
                    className={cn(
                      "relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                      tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === t && (
                      <motion.div
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/50"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{t === "signin" ? "Sign In" : "Create Account"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {tab === "signin" ? (
                  <motion.form
                    key="signin"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="Enter your password"
                          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Link href="/reset-password" className="text-xs text-primary hover:underline" onClick={handleClose}>
                        Forgot password?
                      </Link>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button type="submit" disabled={submitting} className="w-full h-10 rounded-xl gap-2">
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                      {submitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegister}
                    className="space-y-3.5"
                  >
                    <div className="flex gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, role: r.value })}
                          className={cn(
                            "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                            registerForm.role === r.value
                              ? "border-primary/40 bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-border/80"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="tel"
                            value={registerForm.phoneNumber}
                            onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                            placeholder="+1 234 567..."
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                      <textarea
                        value={registerForm.bio}
                        onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                        placeholder={registerForm.role === "recruiter" ? "Tell us about your company..." : "Tell us about yourself..."}
                        rows={2}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Resume (optional)</label>
                      <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background py-2.5 px-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer transition-all">
                        <FileText size={15} />
                        <span>Upload resume</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setRegisterForm({ ...registerForm, resume: file })
                          }}
                        />
                      </label>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                      >
                        {error}
                      </motion.p>
                    )}

                    <Button type="submit" disabled={submitting} className="w-full h-10 rounded-xl gap-2">
                      {submitting ? <Loader2 size={15} className="animate-spin" /> : <Briefcase size={15} />}
                      {submitting ? "Creating account..." : `Create ${registerForm.role === "recruiter" ? "Company" : "Account"}`}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
