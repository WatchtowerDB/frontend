import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import { type ClientDB, type ClientDBCreate, type ClientDBPatch } from "@/types/compliance"

export interface ClientDBFilters {
  name?: string
  // Pagination & Sorting
  page?: number
  ordering?: string[]
}

// To retrieve client databases per page
export const getClientDBs = async (
  filters: ClientDBFilters = {},
): Promise<PaginatedResponse<ClientDB>> => {
  const response = await api.get<PaginatedResponse<ClientDB>>("/api/compliance/clientdb/", {
    params: filters,
  })

  return response.data
}

// Retrieve a SPECIFIC client database by ID
export const getClientDBById = async (id: number): Promise<ClientDB> => {
  if (!id) throw new Error("An ID is required to fetch a specific client database.")

  const response = await api.get<ClientDB>(`/api/compliance/clientdb/${id}/`)
  return response.data
}

// Create a new client database
export const createClientDB = async (data: ClientDBCreate): Promise<ClientDB> => {
  const response = await api.post<ClientDB>("/api/compliance/clientdb/", data)
  return response.data
}

// Update a client database (full update)
export const updateClientDB = async (id: number, data: ClientDBCreate): Promise<ClientDB> => {
  const response = await api.put<ClientDB>(`/api/compliance/clientdb/${id}/`, data)
  return response.data
}

// Partially update a client database
export const partialUpdateClientDB = async (id: number, data: ClientDBPatch): Promise<ClientDB> => {
  const response = await api.patch<ClientDB>(`/api/compliance/clientdb/${id}/`, data)
  return response.data
}

// Delete a client database
export const deleteClientDB = async (id: number): Promise<void> => {
  await api.delete(`/api/compliance/clientdb/${id}/`)
}
