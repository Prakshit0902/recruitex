"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { jobApi, type Company, type Job } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fadeUp, scaleIn } from "@/hooks/useScrollReveal"
import { ArrowLeft, Building2, Globe, MapPin, ChevronRight, Clock, Sparkles } from "lucide-react"

export default function CompanyDetailSection({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    const id = parseInt(companyId)
    if (isNaN(id)) return
    Promise.all([
      jobApi.getCompany(id).catch(() => null),
      jobApi.list().catch(() => [] as Job[]),
    ]).then(([companyData, jobsData]) => {
      if (!companyData) { router.push("/companies"); return }
      setCompany(companyData)
      setJobs(Array.isArray(jobsData) ? jobsData.filter((j) => j.companyId === id) : [])
    }).finally(() => setLoading(false))
  }, [companyId, router])

  if (loading) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
          <div className="h-6 w-24 bg-muted rounded-lg" />
          <div className="flex items-center gap-4"><div className="size-16 bg-muted rounded-xl" /><div className="h-8 w-1/2 bg-muted rounded-lg" /></div>
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
      </section>
    )
  }

  if (!company) return null

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28 min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--accent-brand)_3%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to companies
          </Link>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 lg:p-8 mb-8"
        >
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="size-12 rounded-xl object-cover" />
              ) : (
                <Building2 size={30} />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{company.name}</h1>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1">
                  <Globe size={13} />
                  {new URL(company.website).hostname}
                </a>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Sparkles size={14} className="text-primary" />
                <span className="text-sm text-muted-foreground">{jobs.length} active jobs</span>
              </div>
            </div>
          </div>
          {company.description && (
            <p className="text-muted-foreground leading-relaxed mt-6 pt-6 border-t border-border/50">
              {company.description}
            </p>
          )}
        </motion.div>

        {jobs.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"} custom={1}>
            <h2 className="text-xl font-bold text-foreground mb-4">Open Positions</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.jobId} href={`/jobs/${job.jobId}`}>
                  <div className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/30 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{job.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{job.jobType.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
