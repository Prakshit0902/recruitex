"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Monitor, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const themeStyles: Record<string, string> = {
  crisp: "bg-linear-to-br from-indigo-500 to-indigo-300",
  dark: "bg-linear-to-br from-indigo-500 to-purple-800",
  midnight: "bg-linear-to-br from-blue-600 to-cyan-500",
  sunset: "bg-linear-to-br from-amber-500 to-rose-600",
}

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const current = themes.find((t) => t.id === theme)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Switch theme"
      >
        <span
          className={cn("inline-block size-4 rounded-full", themeStyles[theme])}
        />
        <span className="hidden sm:inline font-medium">{current.label}</span>
        <Palette size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card p-1.5 shadow-lg backdrop-blur-xl z-50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                theme === t.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 rounded-full shrink-0",
                  themeStyles[t.id]
                )}
              />
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.id && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
