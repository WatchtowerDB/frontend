// The individual Assertion object.
export type AssertionStatus = "ANALYZING" | "COMPLETED" | "EXECUTING" | "FAILED" | "PENDING"

export interface AssertionItem {
  id: number
  sql_query: string
  query_output: string
  result: boolean
  recommendation: string
  status: AssertionStatus
  updated_at: string
  compliance_framework: number
  client_db: number
  schema: number
  compliance_check: number
}

// Client Database object
export interface ClientDB {
  id: number
  name: string
  connection_string: string
}

export interface ClientDBCreate {
  name: string
  connection_string: string
}

export interface ClientDBPatch {
  name?: string
  connection_string?: string
}

// Client Database Schema object
export interface ClientDBSchema {
  id: number
  internal_version: number
  name: string
  description: string | null
  sql_definition: string | null
  created_at: string
  client_db: number
}

export interface ClientDBSchemaCreate {
  name: string
  description: string | null
  sql_definition: string | null
  client_db: number
}

// For uploading schema
export interface ClientDBSchemaUpload {
  sql_file: File
  client_db: number
  name: string
  description?: string | null
}

// Frameworks object
export interface Framework {
  id: number
  name: string
  description: string
  version: string
}

// Check object

export type CheckStatus =
  | "ANALYZING"
  | "COMPLETED"
  | "EXECUTING"
  | "FAILED"
  | "GENERATING"
  | "PENDING"

export interface Check {
  id: number
  framework: number
  client_db: number
  client_db_name: string
  user: number
  schema: {
    id: number
    name: string
    internal_version: number
  }
  date: string
  status: CheckStatus
}
