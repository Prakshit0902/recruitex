"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Sparkles,
  Zap,
  LayoutDashboard,
  Building2,
  BarChart3,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithms analyze skills, experience, and culture fit to connect the right talent with the right roles in real time, making hiring smarter and faster.",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    accent: "from-primary to-brand-400",
  },
  {
    icon: Zap,
    title: "One-Click Apply",
    description:
      "Save your profile and resume once, then apply to hundreds of positions with a single click. No repetitive form-filling, no lost time.",
    gradient: "from-accent-brand/20 via-accent-brand/5 to-transparent",
    accent: "from-accent-brand to-rose-500",
  },
  {
    icon: LayoutDashboard,
    title: "Real-Time Tracking Dashboard",
    description:
      "Monitor every application from submission to offer. Get notified at each stage with a clean timeline view, smart insights, and actionable next steps.",
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    icon: Building2,
    title: "Recruiter Suite",
    description:
      "Post jobs, filter AI-ranked candidates, schedule interviews, and manage your entire hiring pipeline from a single, intuitive dashboard.",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Skill Insights & Analytics",
    description:
      "Access data-driven market trends, salary benchmarks, and skill gap analysis to make informed career or hiring decisions with confidence.",
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    accent: "from-violet-500 to-purple-500",
  },
]

function FeaturePanel({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-120px" })
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -80 : 80, rotateY: isLeft ? 5 : -5 }}
      animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: index * 0.1,
      }}
      className="group relative rounded-3xl border border-border bg-card/40 backdrop-blur-sm p-8 lg:p-10 overflow-hidden hover:border-transparent transition-colors duration-500"
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />

      <div className="relative flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
        <motion.div
          className={`shrink-0 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br ${feature.accent} p-0.5 shadow-lg`}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex size-full items-center justify-center rounded-[12px] bg-card">
            <feature.icon size={26} className="text-foreground" />
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl lg:text-5xl font-black text-primary/10 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground">
              {feature.title}
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {feature.description}
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "40px" } : { width: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            className="h-0.5 rounded-full bg-linear-to-r from-primary to-transparent mt-4"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_4%,transparent),transparent_60%)]" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center mb-16 lg:mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">succeed</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Built for both job seekers and recruiters, RecruiteX combines AI smarts
            with intuitive design to make hiring human again.
          </p>
        </motion.div>

        <div className="space-y-6 lg:space-y-8">
          {features.map((feature, i) => (
            <FeaturePanel key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl group"
          >
            Explore all features
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
