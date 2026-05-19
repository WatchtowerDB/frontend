import { runComplianceCheck } from "@/api/assertions"
import { getChecks } from "@/api/check"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useChecks() {
  return useQuery({
    queryKey: ["checks", "list"],
    queryFn: () => getChecks(),
    staleTime: 0, // The checks are dynamic and change often enough.
    placeholderData: (prev) => prev,
  })
}

export function useRunComplianceCheck() {
  const queryClient = useQueryClient()
  const { setActiveCheckId, reset } = useComplianceCheckStore()

  return useMutation({
    mutationFn: ({ frameworkId, schemaId }: { frameworkId: number; schemaId: number }) =>
      runComplianceCheck(frameworkId, schemaId),
    onMutate: () => reset(),
    onSuccess: (data) => {
      setActiveCheckId(data.id)
      queryClient.invalidateQueries({ queryKey: ["checks", "list"] })
    },
  })
}
