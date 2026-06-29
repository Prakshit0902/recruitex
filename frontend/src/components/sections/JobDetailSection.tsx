"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { jobApi, type Job } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fadeUp, scaleIn } from "@/hooks/useScrollReveal"
import { ArrowLeft, MapPin, Clock, Building2, DollarSign, Users, ExternalLink, Send, Loader2, CheckCircle } from "lucide-react"
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
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
