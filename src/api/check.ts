import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import { type Check } from "@/types/compliance"

export interface CheckFilters {
  check?: number // TODO: Clear this up. This filter is useless for just CheckFilters because by ID is a different endpoint.
  page?: number
}

// To retrieve ALL compliance checks
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
