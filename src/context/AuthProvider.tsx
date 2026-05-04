import { useEffect, useState } from "react"
import api from "../api/axiosInstance"
import { LoadingOverlay } from "../components/ui/loading-overlay"
import { useAuthStore } from "../stores/useAuthStore"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAccessToken, logout } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.post("/auth/refresh/", {})
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
    return (
      <LoadingOverlay
        title="Loading Watchtower"
        message="Authenticating and initializing your workspace"
      />
    )
  }

  return <>{children}</>
}
