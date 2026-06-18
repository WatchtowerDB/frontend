import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import { type Framework } from "@/types/compliance"

export interface FrameworkFilters {
  description?: string
  name?: string
  search?: string
  // Pagination & Sorting
  page?: number
  ordering?: string[]
}

// To retrieve frameworks per page
export const getFrameworks = async (
  filters: FrameworkFilters = {},
): Promise<PaginatedResponse<Framework>> => {
  const response = await api.get<PaginatedResponse<Framework>>("/api/compliance/frameworks/", {
    params: filters,
  })

  return response.data
}

// Retrieve a SPECIFIC framework by ID
export const getFrameworkById = async (id: number): Promise<Framework> => {
  if (!id) throw new Error("An ID is required to fetch a specific framework.")

  const response = await api.get<Framework>(`/api/compliance/frameworks/${id}/`)
  return response.data
}
