"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { jobApi, aiApi, type Job } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fadeUp, scaleIn } from "@/hooks/useScrollReveal"
import { ArrowLeft, MapPin, Clock, Building2, DollarSign, Users, ExternalLink, Send, Loader2, CheckCircle, Sparkles, AlertTriangle, Copy, Check } from "lucide-react"
import AuthModal from "@/components/AuthModal"

const jobTypeLabels: Record<string, { label: string; color: "success" | "accent" | "warning" | "default" }> = {
  full_time: { label: "Full Time", color: "success" },
  part_time: { label: "Part Time", color: "accent" },
  internship: { label: "Internship", color: "warning" },
  contract: { label: "Contract", color: "default" },
}

const workLocationLabels: Record<string, string> = {
  remote: "Remote",
  on_site: "On-site",
  hybrid: "Hybrid",
}

export default function JobDetailSection({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [matchData, setMatchData] = useState<{ matchScore: number; coverLetter: string; explanation: string } | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const handleCopy = () => {
    if (!matchData) return
    navigator.clipboard.writeText(matchData.coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runAiMatch = async () => {
    if (!job) return
    setLoadingMatch(true)
    setMatchError(null)
    try {
      const res = await aiApi.matchJob(job.jobId)
      setMatchData(res)
    } catch (err: any) {
      setMatchError(err.message || "Failed to analyze resume match")
    } finally {
      setLoadingMatch(false)
    }
  }

  useEffect(() => {
    const id = parseInt(jobId)
    if (isNaN(id)) return
    setLoading(true)
    jobApi.getById(id)
      .then(setJob)
      .catch(() => router.push("/jobs"))
      .finally(() => setLoading(false))
  }, [jobId, router])

  const handleApply = async () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    if (!job) return
    setApplying(true)
    try {
      const formData = new FormData()
      formData.append("jobId", String(job.jobId))
      await jobApi.apply(formData)
      setApplied(true)
    } catch {
      // silently fail
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 bg-muted rounded-lg" />
            <div className="h-10 w-3/4 bg-muted rounded-xl" />
            <div className="h-5 w-1/2 bg-muted rounded-lg" />
            <div className="flex gap-2"><div className="h-7 w-20 bg-muted rounded-full" /><div className="h-7 w-16 bg-muted rounded-full" /></div>
            <div className="h-40 w-full bg-muted rounded-2xl" />
          </div>
        </div>
      </section>
    )
  }

  if (!job) return null

  const typeInfo = jobTypeLabels[job.jobType] || { label: job.jobType, color: "default" as const }

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab="signin" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to jobs
          </Link>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 lg:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{job.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{job.company?.name || "Unknown Company"}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant={typeInfo.color}>{typeInfo.label}</Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={13} />{job.location}</span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock size={13} />{workLocationLabels[job.workLocation]}</span>
                </div>
              </div>
            </div>

            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                <CheckCircle size={18} />
                Applied
              </div>
            ) : (
              <Button size="lg" className="gap-2 rounded-xl shrink-0" onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {applying ? "Applying..." : "Apply Now"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50">
            {[
              { icon: DollarSign, label: "Salary", value: job.salary || "Negotiable" },
              { icon: Users, label: "Openings", value: String(job.openings) },
              { icon: Building2, label: "Department", value: job.role || "General" },
              { icon: ExternalLink, label: "Website", value: job.company?.website ? <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{new URL(job.company.website).hostname}</a> : "—" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon size={18} className="mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Match Section */}
        {user ? (
          user.role === "jobseeker" ? (
            !user.resume ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-6 lg:p-8 mb-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 size-6 mt-0.5 sm:mt-0 shrink-0" />
                    <div>
                      <h3 className="text-md font-semibold text-amber-500 dark:text-amber-400">Resume Required for AI Match</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please upload your resume in the dashboard first to calculate your match score and generate a custom cover letter.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard" passHref>
                    <Button variant="outline" className="rounded-xl shrink-0 border-amber-500/30 hover:bg-amber-500/10 text-amber-500 hover:text-amber-400">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : matchData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 lg:p-8 mb-6 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center size-24 shrink-0">
                      <svg className="size-full -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke="currentColor"
                          className="text-muted/20"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke="currentColor"
                          className="text-primary drop-shadow-[0_0_6px_var(--primary)]"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 - (matchData.matchScore / 100) * 2 * Math.PI * 38}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold text-foreground">
                        {matchData.matchScore}%
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="text-primary size-5" />
                        AI Match Result
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {matchData.explanation}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={runAiMatch}
                    disabled={loadingMatch}
                    variant="outline"
                    className="rounded-xl gap-2 text-xs h-9"
                  >
                    {loadingMatch ? (
                      <>
                        <Loader2 className="animate-spin size-3" />
                        Recalculating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3" />
                        Recalculate
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      Tailored Cover Letter
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-muted-foreground hover:text-foreground text-xs gap-1.5 h-8 px-2.5 rounded-lg"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed font-sans whitespace-pre-line overflow-y-auto max-h-96">
                    {matchData.coverLetter}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 lg:p-8 mb-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles size={120} className="text-primary" />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="text-primary size-5 animate-pulse" />
                      AI Resume Match & Cover Letter
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                      Compare your profile skills and resume PDF against this job's description. Calculate your match percentage and generate a tailored cover letter instantly.
                    </p>
                  </div>
                  <Button
                    onClick={runAiMatch}
                    disabled={loadingMatch}
                    size="lg"
                    className="rounded-xl shadow-lg shadow-primary/20 shrink-0 gap-2 border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    {loadingMatch ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Calculate Match Score
                      </>
                    )}
                  </Button>
                </div>
                {matchError && (
                  <p className="text-sm text-destructive mt-3 flex items-center gap-1.5">
                    <AlertTriangle className="size-4" />
                    {matchError}
                  </p>
                )}
              </motion.div>
            )
          ) : null
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm p-6 lg:p-8 mb-6 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles className="text-primary size-6 mt-0.5 sm:mt-0 shrink-0" />
                <div>
                  <h3 className="text-md font-semibold text-foreground">AI Resume Match & Cover Letter</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in as a candidate to analyze your profile and resume against this job posting with AI.
                  </p>
                </div>
              </div>
              <Button onClick={() => setAuthOpen(true)} className="rounded-xl shrink-0">
                Sign In
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={1}
          className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 lg:p-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
