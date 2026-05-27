// The individual Assertion object.
export interface AssertionItem {
  id: number
  sql_query: string
  query_output: string
  result: boolean
  recommendation: string
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
  client_db: number
  sql_definition: string
  created_at: string
}

export interface ClientDBSchemaCreate {
  client_db: number
  sql_definition: string
}

// For uploading schema
export interface ClientDBSchemaUpload {
  client_db: number
  sql_file: File
}

// Frameworks object
export interface Framework {
  id: number
  name: string
  description: string
  version: string
}

// Check object
export interface Check {
  id: number
  framework: number
  schema: number
  client_db: number
  user: number
  date: string
}
