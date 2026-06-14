import { getFrameworks } from "@/api/frameworks"
import { useQuery } from "@tanstack/react-query"

export function useFrameworks() {
  return useQuery({
    queryKey: ["frameworks", "list"],
    queryFn: () => getFrameworks(),
    staleTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  })
}

export function useAllFrameworks() {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  return useQuery({
    queryKey: ["frameworks", "all"],
    queryFn: async () => {
      const firstPage = await getFrameworks({ page: 1 })
      const totalCount = firstPage.count
      const allResults = [...firstPage.results]
      const totalPages = Math.ceil(totalCount / PAGE_SIZE)

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getFrameworks({ page: i + 2 })),
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
