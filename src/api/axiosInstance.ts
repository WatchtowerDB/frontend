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
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh/`,
          {},
          { withCredentials: true },
        )

        const { accessToken } = response.data
        useAuthStore.getState().setAccessToken(accessToken)

        prevRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(prevRequest)
      } catch (err) {
        console.log("axiosinstance reports here", err)
        useAuthStore.getState().logout()
        return Promise.reject(err)
      }
    }
    return Promise.reject(error.response?.status)
  },
)

export default api
