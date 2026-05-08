import { getAssertions, type AssertionFilters } from "@/api/assertions"
import { useQuery } from "@tanstack/react-query"

export const useAssertions = (filters: AssertionFilters = {}) => {
  return useQuery({
    queryKey: ["assertions", "list", filters],

    queryFn: () => getAssertions(filters),

    // enabled: !!filters.schema,

    staleTime: 1000 * 60 * 5, // 5 minutes. surely that's fine.
  })
}
