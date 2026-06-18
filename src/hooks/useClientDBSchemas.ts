import {
  getClientDBSchemas,
  uploadClientDBSchema,
  type ClientDBSchemaFilters,
} from "@/api/clientdbschema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { useAllClientDBs } from "./useClientDBs"

export function useClientDBSchemas(filters?: ClientDBSchemaFilters) {
  const queryClient = useQueryClient()

  const { data: dbData, isLoading: isDBLoading } = useAllClientDBs()

  const listQuery = useQuery({
    queryKey: ["clientDbSchemas", "list", filters],
    queryFn: () => getClientDBSchemas(filters),
    staleTime: 1000 * 60 * 30,
    enabled: !!filters,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadClientDBSchema,
    onSuccess: () => {
      toast.success("Schema uploaded successfully")
      queryClient.invalidateQueries({ queryKey: ["clientDbSchemas"] })
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail || "Failed to upload schema")
    },
  })

  return {
    schemas: listQuery.data?.results ?? [],
    databases: dbData?.results ?? [],
    isLoading: isDBLoading || (!!filters && listQuery.isLoading),
    isUploading: uploadMutation.isPending,
    uploadSchema: uploadMutation.mutateAsync,
  }
}

// Retrieves all client DB schemas, optionally specific to a client DB or with search.
export function useAllClientDBSchemas(filters: ClientDBSchemaFilters = {}) {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  return useQuery({
    queryKey: ["clientDbSchemas", "all", filters],
    queryFn: async () => {
      const firstPage = await getClientDBSchemas({ ...filters, page: 1 })
      const totalCount = firstPage.count
      const allResults = [...firstPage.results]
      const totalPages = Math.ceil(totalCount / PAGE_SIZE)

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getClientDBSchemas({ ...filters, page: i + 2 }),
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
