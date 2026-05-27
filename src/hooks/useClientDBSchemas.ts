import { getClientDBSchemas, type ClientDBSchemaFilters } from "@/api/clientdbschema"
import type { PaginatedResponse } from "@/types/api"
import type { ClientDBSchema } from "@/types/compliance"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

type ClientDBSchemasResponse = PaginatedResponse<ClientDBSchema>

export function useClientDBSchemas(
  filters?: ClientDBSchemaFilters,
  options?: Omit<
    UseQueryOptions<ClientDBSchemasResponse, Error, ClientDBSchemasResponse, unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["clientDbSchemas", "list", filters],
    queryFn: () => getClientDBSchemas(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
    ...options, // Allows for filtering the data that we work with the moment it arrives.
    // This is the case while the schema system is as it is. To allow filtering only the relevant schema ID.
    // When running a compliance check.
  })
}
