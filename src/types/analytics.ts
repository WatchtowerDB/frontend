export interface DatabaseScoreFilters {
  db_id: number
  framework_id?: number[]
}

export interface FrameworkScoreData {
  framework_compliance: number
  compliance_score: number
  schema_weight: number
  schema_count: number
  assertions_passed: number
  assertions_total: number
}

export interface DatabaseScoreResponse {
  framework_scores: Record<string, FrameworkScoreData>
  compliance_score: number
}

export interface SchemaIterationsFilters {
  db_id: number
  schema_name: string
  framework_id?: number[]
}

export interface IterationScoreData {
  score: number
}

export interface SchemaIterationItem {
  version: string
  framework_scores: Record<string, IterationScoreData>
  compliance_score: number
}
