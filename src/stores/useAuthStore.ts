import api from "@/api/axiosInstance"
import { create } from "zustand"

interface AuthState {
  accessToken: string | null
  userName: string | null
  isAuthenticated: boolean
  login: (credentials: object) => Promise<void>
  logout: () => void
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userName: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await api.post("/auth", credentials)
      const { accessToken, name } = response.data

      set({
        accessToken,
        userName: name,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error("Login failed, you weakling!", error)
      throw error
    }
  },

  setAccessToken: (token) => set({ accessToken: token }),

  logout: () => {
    set({ accessToken: null, userName: null, isAuthenticated: false })
  },
}))
