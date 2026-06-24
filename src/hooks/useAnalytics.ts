import { getDatabaseScore, getSchemaIterations } from "@/api/analytics"
import type { DatabaseScoreFilters, SchemaIterationsFilters } from "@/types/analytics"
import { useQuery } from "@tanstack/react-query"

/**
 * Hook to fetch the overall compliance score data for a specific database.
 * Pass `enabled: !!filters.db_id` at the call-site if the ID is initially null.
 */
export function useDatabaseScore(filters: DatabaseScoreFilters) {
  return useQuery({
    // We include the filters object inside the queryKey so the cache
    // completely separates data by db_id and framework selections!
    queryKey: ["compliance", "analytics", "database-score", filters],
    queryFn: () => getDatabaseScore(filters),

    // Analytics don't shift every second. 5 minutes staleTime saves massive database compute.
    staleTime: 1000 * 60 * 5,

    // Smooth transitions when switching filters
    placeholderData: (prev) => prev,

    // Guardrail: Don't let TanStack Query fire a broken request if db_id isn't provided yet
    enabled: !!filters.db_id,
  })
}

/**
 * Hook to fetch the chronological series of schema versions and their scores.
 */
export function useSchemaIterations(filters: SchemaIterationsFilters) {
  return useQuery({
    queryKey: ["compliance", "analytics", "schema-iterations", filters],
    queryFn: () => getSchemaIterations(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,

    // Guardrail: Only execute if both mandatory parameters are ready
    enabled: !!filters.db_id && !!filters.schema_name,
  })
}
