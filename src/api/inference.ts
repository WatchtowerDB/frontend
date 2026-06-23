import api from "./axiosInstance"

export type InferenceServerStatus = "not_initialized" | "initializing" | "initialized" | "error"

export interface InferenceStatusResponse {
  status: InferenceServerStatus
  details?: {
    disclaimer?: string
    // [key: string]: any // Catch-all for live server metrics
  }
}

// Get the current health and initialization state of the model.
export const getInferenceServerStatus = async (): Promise<InferenceStatusResponse> => {
  const response = await api.get<InferenceStatusResponse>("/api/compliance/model/status/")
  return response.data
}
