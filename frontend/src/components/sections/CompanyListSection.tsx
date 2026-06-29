"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { jobApi, type Company } from "@/lib/api-client"
import { fadeUp, staggerContainer } from "@/hooks/useScrollReveal"
import { Building2, Globe, ChevronRight, Sparkles, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CompanyListSection() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    jobApi.listCompanies()
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--accent-brand)_4%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-brand/20 bg-accent-brand/5 px-4 py-1.5 text-xs font-medium text-accent-brand mb-4">
            <Sparkles size={12} />
            {companies.length} companies hiring
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Discover{" "}
            <span className="text-gradient-brand">companies</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Explore organizations that are actively looking for talent like you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/40 p-6 animate-pulse">
                <div className="flex items-center gap-4"><div className="size-12 bg-muted rounded-xl" /><div className="h-5 w-2/3 bg-muted rounded-lg" /></div>
                <div className="h-4 w-full bg-muted rounded-lg mt-4" />
                <div className="h-4 w-3/4 bg-muted rounded-lg mt-2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg text-muted-foreground">No companies found</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((company, i) => (
              <CompanyCard key={company.companyId} company={company} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
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
      <Link href={`/companies/${company.companyId}`}>
        <div className="group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 h-full">
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="size-8 rounded-lg object-cover" />
              ) : (
                <Building2 size={22} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{company.name}</h3>
              {company.website && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Globe size={10} />
                  {new URL(company.website).hostname}
                </p>
              )}
            </div>
            <ChevronRight size={16} className="mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
          {company.description && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed">
              {company.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
