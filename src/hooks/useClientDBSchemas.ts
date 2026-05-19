import { getClientDBSchemas, type ClientDBSchemaFilters } from "@/api/clientdbschema"
import { useQuery } from "@tanstack/react-query"

export function useClientDBSchemas(filters?: ClientDBSchemaFilters) {
  return useQuery({
    queryKey: ["clientDbSchemas", "list", filters],
    queryFn: () => getClientDBSchemas(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  })
}
