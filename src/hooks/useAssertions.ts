import { getAssertionById, getAssertions, type AssertionFilters } from "@/api/assertions"
import { PAGE_SIZE, useAssertionStore } from "@/stores/useAssertionStore"
import type { AssertionItem } from "@/types/compliance"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useShallow } from "zustand/shallow"

export const useAssertions = (overrideFilters?: Partial<AssertionFilters>) => {
  // It will use the store's filters (so for assertions list) if not explicitly given filters (so for summary page).
  const storeFilters = useAssertionStore(useShallow((s) => s.getApiFilters()))
  const filters = overrideFilters ?? storeFilters

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

export function useAllAssertions(filters: AssertionFilters = {}) {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  return useQuery({
    queryKey: ["assertions", "all", filters],
    queryFn: async () => {
      const firstPage = await getAssertions({ ...filters, page: 1 })
      const totalCount = firstPage.count
      const allResults = [...firstPage.results]
      const totalPages = Math.ceil(totalCount / PAGE_SIZE)

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getAssertions({ ...filters, page: i + 2 }),
          ),
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
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
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
    placeholderData: (prev) => prev,
  })
}

// Using this feels extremely suboptimal. For now, since data aggregation is required on the front end.
export function useAssertionsByCheckIds(checkIds: number[]) {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20

  return useQueries({
    queries: checkIds.map((id) => ({
      queryKey: ["assertions", "all", { check: id }],
      queryFn: async () => {
        const firstPage = await getAssertions({ check: [id], page: 1 })
        const totalCount = firstPage.count
        const allResults = [...firstPage.results]
        const totalPages = Math.ceil(totalCount / PAGE_SIZE)

        if (totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              getAssertions({ check: [id], page: i + 2 }),
            ),
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
      enabled: checkIds.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  })
}
