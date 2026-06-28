"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  UserPlus,
  Search,
  Send,
  BellRing,
  Building2,
  FileText,
  Users,
  Handshake,
} from "lucide-react"

type Tab = "jobseeker" | "recruiter"

interface Step {
  step: number
  icon: typeof UserPlus
  title: string
  description: string
}

const jobseekerSteps: Step[] = [
  {
    step: 1, icon: UserPlus, title: "Create Your Profile",
    description: "Sign up in minutes and build a rich profile showcasing your skills, experience, and career aspirations.",
  },
  {
    step: 2, icon: Search, title: "Discover Matches",
    description: "Browse AI-curated job listings tailored to your unique skill set, preferences, and career goals.",
  },
  {
    step: 3, icon: Send, title: "Apply with Ease",
    description: "Submit applications instantly with your saved profile. Track every application from a single dashboard.",
  },
  {
    step: 4, icon: BellRing, title: "Stay Ahead",
    description: "Receive real-time updates on application status, interview invites, and new opportunities that match you.",
  },
]

const recruiterSteps: Step[] = [
  {
    step: 1, icon: Building2, title: "Set Up Your Company",
    description: "Create a compelling company page that showcases your brand, culture, and what makes you unique.",
  },
  {
    step: 2, icon: FileText, title: "Post Opportunities",
    description: "Craft detailed job postings with smart skill tagging. Reach the right candidates instantly.",
  },
  {
    step: 3, icon: Users, title: "Review AI Rankings",
    description: "Get applicants ranked by relevance. Filter, shortlist, and compare candidates side by side.",
  },
  {
    step: 4, icon: Handshake, title: "Connect & Hire",
    description: "Schedule interviews, send offers, and manage your entire hiring workflow from one dashboard.",
  },
]

const tabData: Record<Tab, { steps: Step[]; label: string }> = {
  jobseeker: { steps: jobseekerSteps, label: "For Job Seekers" },
  recruiter: { steps: recruiterSteps, label: "For Recruiters" },
}

function TimelineStep({
  step,
  index,
  total,
  isLeft,
}: {
  step: Step
  index: number
  total: number
  isLeft: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const Icon = step.icon

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-6 lg:gap-12 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
    >
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60, scale: 0.9 }}
        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex-1"
      >
        <div
          className={`max-w-lg rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 lg:p-8 ${isLeft ? "lg:ml-auto" : "lg:mr-auto"}`}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="shrink-0 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={24} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                >
                  {step.step}
                </motion.span>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative hidden lg:flex items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.1,
          }}
          className="size-10 rounded-full border-4 border-background bg-primary flex items-center justify-center"
        >
          <motion.div
            className="size-2 rounded-full bg-primary-foreground"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        </motion.div>
      </div>

      <div className="flex-1 hidden lg:block" />
    </div>
  )
}

export default function HowItWorks() {
  const [tab, setTab] = useState<Tab>("jobseeker")
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })
  const current = tabData[tab]

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent-brand)_4%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-brand/20 bg-accent-brand/5 px-4 py-1.5 text-xs font-medium text-accent-brand mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Your journey,{" "}
            <span className="text-gradient-brand">your way</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Whether you&apos;re searching for the perfect role or the perfect
            candidate, we&apos;ve simplified every step.
          </p>
        </motion.div>

        <div className="mt-12 flex justify-center">
          <div className="relative inline-flex rounded-xl border border-border bg-card p-1">
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg bg-primary"
              layoutId="tab-bg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                left: tab === "jobseeker" ? "4px" : undefined,
                right: tab === "recruiter" ? "4px" : undefined,
                width: "calc(50% - 4px)",
              }}
            />
            {(Object.keys(tabData) as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative z-10 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {t === "jobseeker" ? <Search size={15} /> : <Building2 size={15} />}
                {tabData[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/30 via-border to-accent-brand/30 hidden lg:block"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: "top" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 lg:space-y-16"
            >
              {current.steps.map((step, i) => (
                <TimelineStep
                  key={step.step}
                  step={step}
                  index={i}
                  total={current.steps.length}
                  isLeft={i % 2 === 0}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
