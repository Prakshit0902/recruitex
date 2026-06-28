"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ArrowDown } from "lucide-react"

const seed = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  left: `${seed(i * 7 + 1) * 100}%`,
  top: `${seed(i * 13 + 3) * 100}%`,
  duration: 3 + seed(i * 17 + 5) * 4,
  delay: seed(i * 23 + 7) * 5,
}))

const staggerWords = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const

const wordReveal = {
  hidden: { opacity: 0, y: 40, rotateX: 15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

interface Particle {
  left: string
  top: string
  duration: number
  delay: number
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-primary/20"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-hero-gradient">
      <Particles />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center pt-20 pb-16 lg:pt-28 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8 backdrop-blur-sm"
          >
            <motion.span
              className="size-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Connecting talent worldwide
          </motion.div>

          <motion.h1
            variants={staggerWords}
            initial="hidden"
            animate="visible"
            className="text-center text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] max-w-5xl"
          >
            <span className="text-gradient">Where Talent</span>
            <br />
            <span className="text-foreground inline-flex flex-wrap justify-center gap-x-4">
              {["Meets", "Opportunity"].map((word) => (
                <motion.span key={word} variants={wordReveal} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: easeOut }}
            className="mt-6 max-w-xl text-center text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            RecruiteX connects skilled professionals with forward-thinking companies.
            Whether you&apos;re taking the next step in your career or building your dream
            team, we make the perfect match.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2, ease: easeOut }}
            className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-lg"
          >
            <div className="relative flex-1 group">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                placeholder="Job title, skill, or keyword"
                className="w-full rounded-xl border border-border bg-background/60 backdrop-blur-md py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <div className="relative flex-1 group">
              <MapPin
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                placeholder="Location or remote"
                className="w-full rounded-xl border border-border bg-background/60 backdrop-blur-md py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <Button
              size="lg"
              className="h-[46px] gap-2 shrink-0 shadow-lg shadow-primary/25 group"
            >
              <Search size={16} />
              Search
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground"
          >
            <span className="font-medium text-foreground">Popular:</span>
            {["Software Engineer", "Data Scientist", "UX Designer", "Product Manager"].map(
              (role, i) => (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.8 + i * 0.1 }}
                  whileHover={{ scale: 1.05, borderColor: "var(--primary)" }}
                  className="rounded-full border border-border px-3 py-1 hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-colors"
                >
                  {role}
                </motion.button>
              )
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  )
}
