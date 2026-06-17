import { getInferenceServerStatus } from "@/api/inference"
import { useQuery } from "@tanstack/react-query"

export const useInferencePolling = (pollingIntervalMs = 5000) => {
  return useQuery({
    queryKey: ["inference", "status"],
    queryFn: getInferenceServerStatus,
    refetchInterval: pollingIntervalMs,
    refetchIntervalInBackground: true,
    retry: 3,
    // Exponential backoff: waits longer between each consecutive failure retry
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),

    // Don't mark data as stale instantly
    staleTime: pollingIntervalMs - 1000,

    // Prevent garbage collection from wiping the cached status instantly on failure
    gcTime: 1000 * 60 * 5,

    // TODO: Confirm if this configuration aligns with what Robin has in mind :>
  })
}
