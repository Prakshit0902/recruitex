"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Briefcase, Building, Users, Star } from "lucide-react"

const stats = [
  { icon: Briefcase, value: 12000, suffix: "+", label: "Jobs Posted" },
  { icon: Building, value: 850, suffix: "+", label: "Companies" },
  { icon: Users, value: 15000, suffix: "+", label: "Professionals" },
  { icon: Star, value: 96, suffix: "%", label: "Satisfaction" },
]

function Counter({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const hasCounted = useRef(false)

  useEffect(() => {
    if (isInView && !hasCounted.current) {
      hasCounted.current = true
      const duration = 2000
      const steps = 60
      const increment = end / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
    }
  }, [isInView, end])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

const orbVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 60,
    x: i % 2 === 0 ? -40 : 40,
    scale: 0.7,
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: easeOut,
    },
  }),
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_3%,transparent),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                custom={i}
                variants={orbVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 lg:p-8 text-center overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <div className="relative">
                  <motion.div
                    className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon size={24} />
                  </motion.div>
                  <div className="text-3xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
