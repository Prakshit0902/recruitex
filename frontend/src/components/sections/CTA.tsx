"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

function FloatingShape({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 10, -5, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  )
}

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent-brand/5 to-transparent"
        animate={
          isInView
            ? {
                background: [
                  "linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--accent-brand) 5%, transparent), transparent)",
                  "linear-gradient(135deg, color-mix(in oklch, var(--accent-brand) 10%, transparent), color-mix(in oklch, var(--primary) 5%, transparent), transparent)",
                  "linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--accent-brand) 5%, transparent), transparent)",
                ],
              }
            : {}
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden"
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `conic-gradient(from var(--border-angle), color-mix(in oklch, var(--primary) 30%, transparent), color-mix(in oklch, var(--accent-brand) 30%, transparent), color-mix(in oklch, var(--primary) 30%, transparent))`,
              animation: "rotate-border 4s linear infinite",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />

          <FloatingShape className="size-48 bg-primary/10 -top-20 -right-20 blur-3xl" delay={0} />
          <FloatingShape className="size-36 bg-accent-brand/10 -bottom-16 -left-16 blur-3xl" delay={2} />
          <FloatingShape className="size-24 bg-primary/8 top-1/2 left-1/4 blur-2xl" delay={4} />

          <div className="relative px-8 py-16 sm:px-14 sm:py-20 lg:px-20 lg:py-24 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.2,
              }}
              className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-6"
            >
              <Sparkles size={30} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto"
            >
              Ready to transform your{" "}
              <span className="text-gradient-brand">career</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto"
            >
              Join thousands of professionals and companies already connected on
              RecruiteX. Your next opportunity is one click away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="h-12 px-8 gap-2 text-base rounded-xl shadow-lg shadow-primary/25 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 gap-2 text-base rounded-xl"
              >
                Talk to Sales
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="mt-6 text-xs text-muted-foreground"
            >
              No credit card required &middot; Free for job seekers &middot; Cancel anytime
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
