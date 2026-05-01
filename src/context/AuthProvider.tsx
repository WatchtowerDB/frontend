import { useEffect, useState } from "react"
import api from "../api/axiosInstance"
import { useAuthStore } from "../stores/useAuthStore"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAccessToken, logout } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/refresh")
        const { accessToken, name } = response.data

        setAccessToken(accessToken)
        useAuthStore.setState({ userName: name, isAuthenticated: true })
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
