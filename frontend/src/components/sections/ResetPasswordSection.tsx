"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { authApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Mail, ArrowLeft, Loader2, CheckCircle, Sparkles, Eye, EyeOff } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ResetPasswordSection() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [step, setStep] = useState<"email" | "reset" | "done">(token ? "reset" : "email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Enter your email"); return }
    setSubmitting(true)
    try {
      const res = await authApi.forgotPassword(email)
      setMessage(res.message || "Check your email for reset link")
      setStep("done")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (!token) { setError("Invalid reset link"); return }
    setSubmitting(true)
    try {
      const res = await authApi.resetPassword(token, password)
      setMessage(res.message || "Password reset successfully")
      setStep("done")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28 min-h-screen flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-md px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {step === "done" ? <CheckCircle size={24} /> : <Lock size={24} />}
                </div>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {step === "email" ? "Forgot Password" : step === "reset" ? "Reset Password" : "Check your email"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "email" ? "Enter your email and we'll send you a reset link" :
                 step === "reset" ? "Enter your new password below" :
                 message || "We've sent instructions to your email"}
              </p>
            </div>

            {step === "email" && (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full h-11 gap-2">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  Send Reset Link
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="pl-10 pr-10 h-11"
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
                {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full h-11 gap-2">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  Reset Password
                </Button>
              </form>
            )}

            {step === "done" && (
              <div className="text-center">
                <Link href="/">
                  <Button className="mt-2 gap-2 rounded-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
