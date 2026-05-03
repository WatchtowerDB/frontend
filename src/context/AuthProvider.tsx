import { useEffect, useState } from "react"
import api from "../api/axiosInstance"
import { useAuthStore } from "../stores/useAuthStore"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAccessToken, logout } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const refreshToken = localStorage.getItem("refresh_token")

  // Refer to the TODO in useAuthStore.ts. ^

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!refreshToken) return logout()
        const response = await api.post("/auth/refresh/", { refresh: refreshToken })
        const { access } = response.data

        setAccessToken(access)
        useAuthStore.setState({ isAuthenticated: true })
      } catch (err) {
        logout()
      } finally {
        setIsInitializing(false)
      }
    }

    checkAuth()
  }, [setAccessToken, logout])

  if (isInitializing) {
    return <div className="loading">Setting up site...</div>
  }

  return <>{children}</>
}
