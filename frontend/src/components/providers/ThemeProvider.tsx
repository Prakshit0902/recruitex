"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "crisp" | "dark" | "midnight" | "sunset"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: { id: Theme; label: string; icon: string }[]
}

const themes: { id: Theme; label: string; icon: string }[] = [
  { id: "crisp", label: "Crisp", icon: "☀️" },
  { id: "dark", label: "Onyx", icon: "🌙" },
  { id: "midnight", label: "Nebula", icon: "🔮" },
  { id: "sunset", label: "Ember", icon: "🌅" },
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "crisp"
  const stored = localStorage.getItem("recruitex-theme") as Theme | null
  if (stored && ["crisp", "dark", "midnight", "sunset"].includes(stored)) return stored
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  return "crisp"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("crisp")

  useEffect(() => {
    setThemeState(getInitialTheme())
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute("data-theme")
    if (prev) root.removeAttribute("data-theme")
    if (theme !== "crisp") root.setAttribute("data-theme", theme)
    localStorage.setItem("recruitex-theme", theme)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
