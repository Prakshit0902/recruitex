"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Code2,
  Brain,
  Blocks,
  Palette,
  Container,
  Megaphone,
  BarChart3,
  Users,
  BadgeDollarSign,
  PenLine,
} from "lucide-react"

const categories = [
  {
    name: "Technology",
    color: "from-primary/20 to-primary/5",
    roles: [
      { icon: Code2, name: "Software Engineer", count: 1240 },
      { icon: Brain, name: "Data Scientist", count: 890 },
      { icon: Blocks, name: "DevOps Engineer", count: 670 },
      { icon: Container, name: "Cloud Architect", count: 540 },
    ],
  },
  {
    name: "Design & Product",
    color: "from-accent-brand/20 to-accent-brand/5",
    roles: [
      { icon: Palette, name: "UX Designer", count: 720 },
      { icon: PenLine, name: "Content Strategist", count: 340 },
      { icon: Megaphone, name: "Product Marketing", count: 480 },
    ],
  },
  {
    name: "Business & Finance",
    color: "from-emerald-500/20 to-emerald-500/5",
    roles: [
      { icon: BarChart3, name: "Financial Analyst", count: 560 },
      { icon: Users, name: "HR Business Partner", count: 390 },
      { icon: BadgeDollarSign, name: "Sales Executive", count: 620 },
    ],
  },
]

function RolePill({
  role,
  index,
}: {
  role: { icon: typeof Code2; name: string; count: number }
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const Icon = role.icon

  const size =
    role.count > 1000 ? "lg" : role.count > 600 ? "md" : "sm"

  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-sm gap-2.5",
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.4, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.08,
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <button
        className={`group inline-flex items-center rounded-full border border-border bg-card/40 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 ${sizeClasses[size]}`}
      >
        <Icon
          size={size === "sm" ? 14 : 16}
          className="text-primary group-hover:scale-110 transition-transform"
        />
        <span className="font-medium text-foreground">{role.name}</span>
        <span className="text-muted-foreground/60 tabular-nums text-[90%]">
          {role.count.toLocaleString()}
        </span>
      </button>
    </motion.div>
  )
}

function CategorySection({
  category,
  index,
}: {
  category: (typeof categories)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref}>
      <motion.h3
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2"
      >
        <motion.span
          className="size-1.5 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        />
        {category.name}
      </motion.h3>
      <div className="flex flex-wrap gap-3">
        {category.roles.map((role, i) => (
          <RolePill key={role.name} role={role} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function TrendingRoles() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_70%)]" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Explore trending{" "}
            <span className="text-gradient">roles</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Discover the most in-demand positions across industries, curated
            from thousands of active listings.
          </p>
        </motion.div>

        <div className="space-y-12">
          {categories.map((category, i) => (
            <CategorySection key={category.name} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
