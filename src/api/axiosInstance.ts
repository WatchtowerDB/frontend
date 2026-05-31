import { toAPIError } from "@/lib/utils"
import axios from "axios"
import { useAuthStore } from "../stores/useAuthStore"
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config
    const isLoginRequest =
      prevRequest?.url?.includes("/auth/") && !prevRequest?.url?.includes("/refresh/") // so it doesn't affect login page
    if (error?.response?.status === 401 && !prevRequest?.sent && !isLoginRequest) {
      console.log("Hello hello!", error.response.status)
      prevRequest.sent = true

      try {
        console.log("attempting to refresh token")
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh/`,
          {},
          { withCredentials: true },
        )

        const { access } = response.data
        useAuthStore.getState().setAccessToken(access)

        prevRequest.headers.Authorization = `Bearer ${access}`
        return api(prevRequest)
      } catch (err) {
        console.log("axiosinstance reports here", err)
        useAuthStore.getState().logout()
        return Promise.reject(err)
      }
    }
    return Promise.reject(toAPIError(error))
    // Whenever any component is handling an api fetch error, add const apiError = error as APIError for graceful handling.
  },
)

export default api
