import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import { type Check } from "@/types/compliance"

export interface CheckFilters {
  client_db?: number
  framework?: number
  // Pagination & Sorting
  page?: number
  ordering?: string
}

// to retrieve compliance checks per page
export const getChecks = async (filters: CheckFilters = {}): Promise<PaginatedResponse<Check>> => {
  const response = await api.get<PaginatedResponse<Check>>("/api/compliance/checks/", {
    params: filters,
  })

  return response.data
}

// Retrieve a SPECIFIC compliance check by ID
export const getCheckById = async (id: number): Promise<Check> => {
  if (!id) throw new Error("An ID is required to fetch a specific check.")

  const response = await api.get<Check>(`/api/compliance/checks/${id}/`)
  return response.data
}

// Retrieve the latest compliance check.
export const getLatestCheck = async (): Promise<Check> => {
  const response = await api.get<Check>(`/api/compliance/checks/latest/`)
  return response.data
}
