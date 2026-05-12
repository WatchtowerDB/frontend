import { getAssertions } from "@/api/assertions"
import { ASSERTIONS_PAGE_SIZE, useAssertionStore } from "@/stores/useAssertionStore"
import { useQuery } from "@tanstack/react-query"
import { useShallow } from "zustand/shallow"

export const useAssertions = () => {
  // Pulls the derived API filters.
  const filters = useAssertionStore(useShallow((s) => s.getApiFilters()))
  // const filters = getApiFilters()

  const query = useQuery({
    queryKey: ["assertions", "list", filters],
    queryFn: () => getAssertions(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // Keep previous page data visible while the next page loads. New thing to learn.
  })

  const totalPages = query.data ? Math.ceil(query.data.count / ASSERTIONS_PAGE_SIZE) : 0

  return {
    ...query,
    totalPages,
    // Expose a flat results array so components don't need to drill into data.results. remember this.
    assertions: query.data?.results ?? [],
    totalCount: query.data?.count ?? 0,
  }
}
