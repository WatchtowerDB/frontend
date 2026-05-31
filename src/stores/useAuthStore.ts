import api from "@/api/axiosInstance"
import { toast } from "sonner"
import { create } from "zustand"
import { useComplianceCheckStore } from "./useComplianceCheckStore"

interface AuthState {
  accessToken: string | null
  userName: string | null
  isAuthenticated: boolean
  login: (credentials: object) => Promise<void>
  logout: () => void
  setAccessToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  userName: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/", credentials)
      console.log("Hello hello hello hello hello hello", response)
      const { access } = response.data

      set({
        accessToken: access,
        // userName: name,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error("useAuthStore.ts: Login failed, the error is:", error)
      throw error
    }
  },

  setAccessToken: (token) => set({ accessToken: token }),

  logout: () => {
    if (!get().isAuthenticated) return
    useComplianceCheckStore.getState().reset()
    set({ accessToken: null, userName: null, isAuthenticated: false })
    toast.info("You have been logged out.", {
      duration: 3000,
    })
  },
}))
