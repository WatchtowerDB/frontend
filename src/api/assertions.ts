import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import api from "./axiosInstance"

import { type PaginatedResponse } from "@/types/api"
import { type AssertionItem } from "@/types/compliance"
import { useMutation } from "@tanstack/react-query"

export interface AssertionFilters {
  check?: number
  client_db?: number
  compliance_framework?: number
  result?: boolean
  schema?: number
  // Pagination
  page?: number
}

// To retrieve ALL assertions
export const getAssertions = async (
  filters: AssertionFilters = {},
): Promise<PaginatedResponse<AssertionItem>> => {
  const response = await api.get<PaginatedResponse<AssertionItem>>("/api/compliance/assertions/", {
    params: filters,
  })

  return response.data
}
// Retrieve a SPECIFIC assertion by ID
export const getAssertionById = async (id: number) => {
  if (!id) throw new Error("An ID is required to fetch a specific assertion.")

  const response = await api.get(`/api/compliance/assertions/${id}/`)
  return response.data
}

// Run the pipeline for a compliance check
export const runComplianceCheck = async (frameworkId: number, schemaId: number) => {
  const response = await api.post("/api/compliance/checks/", {
    framework: frameworkId,
    schema: schemaId,
  })
  return response.data
}

export function useRunComplianceCheck() {
  const { setActiveCheckId, reset } = useComplianceCheckStore()

  return useMutation({
    mutationFn: ({ frameworkId, schemaId }: { frameworkId: number; schemaId: number }) =>
      runComplianceCheck(frameworkId, schemaId),
    onMutate: () => reset(), // clear previous run state
    onSuccess: (data) => setActiveCheckId(data.id), // data.id is what your backend returns
  })
}
