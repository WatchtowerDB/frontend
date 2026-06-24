import type {
  DatabaseScoreFilters,
  DatabaseScoreResponse,
  SchemaIterationItem,
  SchemaIterationsFilters,
} from "@/types/analytics"
import api from "./axiosInstance"
/**
 * Returns Compliance Score (CS) for a database across all schema groups and frameworks.
 * Uses only latest schema versions, latest COMPLETED checks, and excludes FAILED assertions.
 */
export const getDatabaseScore = async (
  filters: DatabaseScoreFilters,
): Promise<DatabaseScoreResponse> => {
  if (!filters.db_id) {
    throw new Error("A db_id is required to fetch the database compliance score.")
  }

  const response = await api.get<DatabaseScoreResponse>(
    "/api/compliance/analytics/database-score/",
    { params: filters },
  )

  return response.data
}

/**
 * Returns a chronological series of schema versions for a given database,
 * each annotated with Compliance Score (CS) data derived from the latest COMPLETED check.
 */
export const getSchemaIterations = async (
  filters: SchemaIterationsFilters,
): Promise<SchemaIterationItem[]> => {
  if (!filters.db_id || !filters.schema_name) {
    throw new Error("Both db_id and schema_name are required to analyze schema iterations.")
  }

  const response = await api.get<SchemaIterationItem[]>(
    "/api/compliance/analytics/schema-iterations/",
    { params: filters },
  )

  return response.data
}
