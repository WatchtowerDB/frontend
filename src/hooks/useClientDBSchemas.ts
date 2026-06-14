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

export function useAllClientDBSchemas() {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  return useQuery({
    queryKey: ["clientDbSchemas", "all"],
    queryFn: async () => {
      const firstPage = await getClientDBSchemas({ page: 1 })
      const totalCount = firstPage.count
      const allResults = [...firstPage.results]
      const totalPages = Math.ceil(totalCount / PAGE_SIZE)

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getClientDBSchemas({ page: i + 2 })),
        )
        remainingPages.forEach((pageData) => {
          allResults.push(...pageData.results)
        })
      }

      return {
        ...firstPage,
        results: allResults,
      }
    },
    staleTime: 1000 * 60 * 30,
  })
}
