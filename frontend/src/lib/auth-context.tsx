"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authApi, type User, type LoginInput, type RegisterInput } from "./api-client"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("rx-token")
    const storedUser = localStorage.getItem("rx-user")
    if (storedToken && storedUser && storedUser !== "undefined") {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const res = await authApi.login(input)
    localStorage.setItem("rx-token", res.token)
    localStorage.setItem("rx-user", JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const res = await authApi.register(input)
    localStorage.setItem("rx-token", res.token)
    localStorage.setItem("rx-user", JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("rx-token")
    localStorage.removeItem("rx-user")
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
