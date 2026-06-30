"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { jobApi, type Application } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fadeUp, staggerContainer } from "@/hooks/useScrollReveal"
import { FileText, Briefcase, Clock, CheckCircle, XCircle, Eye, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

const statusConfig: Record<string, { label: string; color: "warning" | "success" | "destructive" }> = {
  submitted: { label: "Submitted", color: "warning" },
  hired: { label: "Hired", color: "success" },
  rejected: { label: "Rejected", color: "destructive" },
}

export default function ApplicationsSection() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/"); return }
    jobApi.listApplications()
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 animate-pulse space-y-4">
          <div className="h-10 w-1/3 bg-muted rounded-xl" />
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <Sparkles size={12} />
            {applications.length} total
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            My <span className="text-gradient">Applications</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Track the status of every job you&apos;ve applied to.</p>
        </motion.div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
          >
            <FileText size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg text-muted-foreground">No applications yet</p>
            <Link href="/jobs"><Button className="mt-4 rounded-full gap-2">Browse Jobs</Button></Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-3"
          >
            {applications.map((app, i) => {
              const status = statusConfig[app.status] || { label: app.status, color: "default" as const }
              return (
                <motion.div
                  key={app.applicationId}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/30 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {app.job?.title || `Position #${app.jobId}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{app.applicantEmail}</p>
                        {app.createdAt && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={status.color}>{status.label}</Badge>
                      {app.job && (
                        <Link href={`/jobs/${app.jobId}`}>
                          <Button variant="ghost" size="icon-xs">
                            <Eye size={14} />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
