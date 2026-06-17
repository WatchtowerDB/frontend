import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import {
  type ClientDBSchema,
  type ClientDBSchemaCreate,
  type ClientDBSchemaUpload,
} from "@/types/compliance"

export interface ClientDBSchemaFilters {
  client_db?: number[]
  // Pagination & Sorting
  page?: number
  ordering?: string[]
}

// To retrieve client database schemas per page
export const getClientDBSchemas = async (
  filters: ClientDBSchemaFilters = {},
): Promise<PaginatedResponse<ClientDBSchema>> => {
  const response = await api.get<PaginatedResponse<ClientDBSchema>>(
    "/api/compliance/clientdbschema/",
    {
      params: filters,
    },
  )

  return response.data
}

// Retrieve a SPECIFIC client database schema by ID
export const getClientDBSchemaById = async (id: number): Promise<ClientDBSchema> => {
  if (!id) throw new Error("An ID is required to fetch a specific client database schema.")

  const response = await api.get<ClientDBSchema>(`/api/compliance/clientdbschema/${id}/`)
  return response.data
}

// Create a new client database schema
export const createClientDBSchema = async (data: ClientDBSchemaCreate): Promise<ClientDBSchema> => {
  const response = await api.post<ClientDBSchema>("/api/compliance/clientdbschema/", data)
  return response.data
}

// Upload a schema file
export const uploadClientDBSchema = async (data: ClientDBSchemaUpload): Promise<ClientDBSchema> => {
  const formData = new FormData()
  formData.append("client_db", data.client_db.toString())
  formData.append("sql_file", data.sql_file)

  const response = await api.post("/api/compliance/clientdbschema/upload-schema/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}
