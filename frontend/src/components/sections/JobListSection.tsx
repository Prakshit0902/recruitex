"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { jobApi, type Job } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fadeUp, staggerContainer } from "@/hooks/useScrollReveal"
import { Search, MapPin, Briefcase, Clock, ChevronRight, Building2, Sparkles } from "lucide-react"

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

export default function JobListSection() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const fetchJobs = useCallback(async () => {
    try {
      const data = await jobApi.list()
      setJobs(Array.isArray(data) ? data : [])
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const filtered = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchSearch = !q || job.title.toLowerCase().includes(q) || job.role?.toLowerCase().includes(q) || job.company?.name?.toLowerCase().includes(q)
    const matchLocation = !location || job.location.toLowerCase().includes(location.toLowerCase())
    const matchType = typeFilter === "all" || job.jobType === typeFilter
    return matchSearch && matchLocation && matchType
  })

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_4%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <Sparkles size={12} />
            {jobs.length} opportunities available
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Find your next{" "}
            <span className="text-gradient">move</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Roles from top companies, curated for your skills and ambitions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl p-4 sm:p-6 mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Job title, skill, or keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Location or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button className="h-11 gap-2 px-6 shrink-0">
              <Search size={16} />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { value: "all", label: "All Types" },
              { value: "full_time", label: "Full Time" },
              { value: "part_time", label: "Part Time" },
              { value: "internship", label: "Internship" },
              { value: "contract", label: "Contract" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  typeFilter === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/40 p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded-lg mb-3" />
                <div className="h-4 w-1/2 bg-muted rounded-lg mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Briefcase size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg text-muted-foreground">No jobs match your criteria</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearch(""); setLocation(""); setTypeFilter("all") }}>
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid gap-4 md:grid-cols-2"
          >
            {filtered.map((job, i) => (
              <JobCard key={job.jobId} job={job} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const typeInfo = jobTypeLabels[job.jobType] || { label: job.jobType, color: "default" as const }
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <Link href={`/jobs/${job.jobId}`}>
        <div className="group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 lg:p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Building2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {job.company?.name || "Unknown Company"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <Badge variant={typeInfo.color} className="text-[10px] px-2 py-0.5">
                  {typeInfo.label}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={11} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  {workLocationLabels[job.workLocation] || job.workLocation}
                </span>
              </div>
              {job.salary && (
                <p className="text-sm font-medium text-foreground mt-2">
                  {job.salary}
                </p>
              )}
            </div>
            <ChevronRight size={16} className="mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
