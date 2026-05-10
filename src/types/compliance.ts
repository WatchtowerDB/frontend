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
