import { getAssertionById, getAssertions } from "@/api/assertions"
import { PAGE_SIZE, useAssertionStore } from "@/stores/useAssertionStore"
import type { AssertionItem } from "@/types/compliance"
import { useQuery } from "@tanstack/react-query"
import { useShallow } from "zustand/shallow"

export const useAssertions = () => {
  // Pulls the derived API filters.
  const filters = useAssertionStore(useShallow((s) => s.getApiFilters()))

  const query = useQuery({
    queryKey: ["assertions", "list", filters],
    queryFn: () => getAssertions(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // Keep previous page data visible while the next page loads.
  })

  const totalPages = query.data ? Math.ceil(query.data.count / PAGE_SIZE) : 0

  return {
    ...query,
    totalPages,
    // Expose a flat results array so components don't need to drill into data.results. remember this when working on components.
    assertions: query.data?.results ?? [],
    totalCount: query.data?.count ?? 0,
  }
}

export const useAssertionDetails = (id: number | null) => {
  return useQuery({
    queryKey: ["assertions", "detail", id],
    queryFn: () => {
      if (!id) throw new Error("An ID is required to fetch a specific assertion.")
      return getAssertionById(id) as Promise<AssertionItem>
    },

    enabled: id !== null && id !== undefined && !isNaN(id),
    staleTime: 1000 * 60 * 5,
  })
}
