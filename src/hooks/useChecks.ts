import { runComplianceCheck } from "@/api/assertions"
import { getChecks, getLatestCheck } from "@/api/check"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ! NOTE: does NOT retrieve all checks currently
export function useChecks() {
  return useQuery({
    queryKey: ["checks", "list"],
    queryFn: () => getChecks(),
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
