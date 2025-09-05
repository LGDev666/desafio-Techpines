"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (token) {
        const userData = await api.me()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await api.login({ email, password })

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
      }
      setUser(userData)
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Credenciais inválidas. Verifique seu email e senha.")
    }
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const { user: userData, token } = await api.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
      }
      setUser(userData)
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Erro ao criar conta. Verifique os dados e tente novamente.")
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }
      setUser(null)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
