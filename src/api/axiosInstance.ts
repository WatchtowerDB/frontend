import { toAPIError } from "@/lib/utils"
import axios from "axios"
import createAuthRefreshInterceptor from "axios-auth-refresh"
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
  (error) => {
    if (error?.response?.status === 401) return Promise.reject(error) // let axios-auth-refresh handle it instead of turning it into an APIError
    return Promise.reject(toAPIError(error))
  },
)

// Surely you understand that this has to stay any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = async (failedRequest: any) => {
  try {
    console.log("refreshAuthLogic firing", failedRequest)
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/auth/refresh/`,
      {},
      { withCredentials: true },
    )
    console.log("refresh response", response.data)
    const { access } = response.data
    useAuthStore.getState().setAccessToken(access)
    failedRequest.response.config.headers.Authorization = `Bearer ${access}`
  } catch (err) {
    useAuthStore.getState().logout()
    return Promise.reject(toAPIError(err))
    // Whenever any component is handling an api fetch error, add const apiError = error as APIError for graceful handling.
  }
}

createAuthRefreshInterceptor(api, refreshAuthLogic)

export default api
