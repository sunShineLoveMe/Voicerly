"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  display_name?: string
  credits: number
  access_token: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for logged in user in localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const login = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user))
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    })
  }

  const logout = () => {
    localStorage.removeItem("user")
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setAuthState({
        user: updatedUser,
        isLoading: false,
        isAuthenticated: true,
      })
    }
  }

  return {
    ...authState,
    login,
    logout,
    updateUser,
  }
}
