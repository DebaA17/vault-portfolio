"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Session error:", error)
        }
        setUser(session?.user ?? null)
        console.log("Initial session:", { user: !!session?.user, error })
      } catch (err) {
        console.error("Failed to get session:", err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, user: !!session?.user })
      setUser(session?.user ?? null)
      setLoading(false)

      // Force a small delay to ensure state is updated
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(() => {
          console.log("Auth state fully updated")
        }, 100)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in result:", {
        success: !!data.user,
        error: error?.message,
        session: !!data.session,
      })

      if (typeof window !== "undefined") {
        console.log(`Admin login attempt: ${email} at ${new Date().toISOString()}`)
      }

      return { error }
    } catch (err) {
      console.error("Sign in exception:", err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
