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
