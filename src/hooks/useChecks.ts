import { runComplianceCheck } from "@/api/assertions"
import { getChecks, getLatestCheck, type CheckFilters } from "@/api/check"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Retrieves all compliance checks
export function useAllChecks() {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  return useQuery({
    queryKey: ["checks", "all"],
    queryFn: async () => {
      const firstPage = await getChecks({ page: 1 })
      const totalCount = firstPage.count
      const allResults = [...firstPage.results]
      const totalPages = Math.ceil(totalCount / PAGE_SIZE)

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getChecks({ page: i + 2 })),
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

// Retrieves it per page with filter.
export function useChecks(filters?: CheckFilters) {
  return useQuery({
    queryKey: ["checks", "list", filters ?? {}],
    queryFn: () => getChecks(filters ?? {}),
    staleTime: 0,
    placeholderData: (prev) => prev,
  })
}

export function useLatestCheck() {
  return useQuery({
    queryKey: ["checks", "latest"],
    queryFn: () => getLatestCheck(),
    staleTime: 0,
  })
}

export function useRunComplianceCheck() {
  const queryClient = useQueryClient()
  const addActiveCheck = useComplianceCheckStore((s) => s.addActiveCheck)

  return useMutation({
    mutationFn: ({ frameworkId, schemaId }: { frameworkId: number; schemaId: number }) =>
      runComplianceCheck(frameworkId, schemaId),
    onSuccess: (data) => {
      // Register the new check — the stream hook picks it up automatically.
      addActiveCheck(data.id)
      queryClient.invalidateQueries({ queryKey: ["checks", "list"] })
    },
  })
}
