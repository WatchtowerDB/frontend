import type { DatabaseScoreResponse, SchemaIterationItem } from "@/types/analytics"
import type { PaginatedResponse } from "@/types/api"
import type { ClientDB, ClientDBSchema, Framework } from "@/types/compliance"

// ---------------------------------------------------------------------------
// Constants & Registry
// ---------------------------------------------------------------------------

export const FRAMEWORKS_REGISTRY: Record<string, string> = {
  "1": "SOC 2",
  "2": "PCI DSS",
  "3": "GDPR",
  "4": "HIPAA",
  "5": "ISO 27001",
  "6": "HITRUST",
  "7": "FedRAMP",
  "8": "CCPA",
  "9": "SOC 3",
  "10": "FISMA",
  "11": "GLBA",
}

// ---------------------------------------------------------------------------
// useAllClientDBs
// ---------------------------------------------------------------------------

export const MOCK_CLIENT_DBS: PaginatedResponse<ClientDB> = {
  count: 5,
  next: null,
  previous: null,
  results: [
    {
      id: 101,
      name: "orders-prod (PostgreSQL)",
      connection_string: "postgres://****:****@orders-prod.internal:5432/orders",
    },
    {
      id: 102,
      name: "user-auth (MySQL)",
      connection_string: "mysql://****:****@user-auth.internal:3306/auth",
    },
    {
      id: 103,
      name: "analytics-wh (Snowflake)",
      connection_string: "snowflake://****:****@analytics-wh.internal/warehouse",
    },
    {
      id: 104,
      name: "billing-core (Oracle)",
      connection_string: "oracle://****:****@billing-core.internal:1521/billing",
    },
    {
      id: 105,
      name: "patient-records (MongoDB)",
      connection_string: "mongodb://****:****@patient-records.internal:27017/records",
    },
  ],
}

// ---------------------------------------------------------------------------
// useAllFrameworks
// ---------------------------------------------------------------------------

export const MOCK_FRAMEWORKS: PaginatedResponse<Framework> = {
  count: 11,
  next: null,
  previous: null,
  results: Object.entries(FRAMEWORKS_REGISTRY).map(([id, name]) => ({
    id: parseInt(id),
    name,
    description: `${name} compliance standard.`,
    version: "1.0",
  })),
}

// ---------------------------------------------------------------------------
// useAllClientDBSchemas
// ---------------------------------------------------------------------------

export const MOCK_CLIENT_DB_SCHEMAS: Record<number, PaginatedResponse<ClientDBSchema>> = {
  101: {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 5001,
        internal_version: 3,
        name: "public",
        description: "Primary application schema",
        sql_definition: "CREATE SCHEMA public;",
        created_at: "2026-03-12T09:00:00Z",
        client_db: 101,
      },
      {
        id: 5002,
        internal_version: 1,
        name: "audit_log",
        description: "Append-only audit trail",
        sql_definition: "CREATE SCHEMA audit_log;",
        created_at: "2026-04-02T14:30:00Z",
        client_db: 101,
      },
    ],
  },
  102: {
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 5101,
        internal_version: 7,
        name: "auth",
        description: "User credentials",
        sql_definition: "CREATE SCHEMA auth;",
        created_at: "2026-01-20T11:15:00Z",
        client_db: 102,
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// useDatabaseScore
// ---------------------------------------------------------------------------

export const MOCK_DATABASE_SCORES: Record<number, DatabaseScoreResponse> = {
  101: {
    compliance_score: 6.2,
    framework_scores: {
      "1": {
        framework_compliance: 5.8,
        compliance_score: 5.8,
        schema_weight: 0.5,
        schema_count: 2,
        assertions_passed: 58,
        assertions_total: 100,
      },
      "5": {
        framework_compliance: 6.5,
        compliance_score: 6.5,
        schema_weight: 0.5,
        schema_count: 2,
        assertions_passed: 65,
        assertions_total: 100,
      },
    },
  },
  102: {
    compliance_score: 8.1,
    framework_scores: {
      "1": {
        framework_compliance: 8.8,
        compliance_score: 8.8,
        schema_weight: 0.33,
        schema_count: 1,
        assertions_passed: 88,
        assertions_total: 100,
      },
      "3": {
        framework_compliance: 7.6,
        compliance_score: 7.6,
        schema_weight: 0.33,
        schema_count: 1,
        assertions_passed: 76,
        assertions_total: 100,
      },
      "11": {
        framework_compliance: 7.9,
        compliance_score: 7.9,
        schema_weight: 0.34,
        schema_count: 1,
        assertions_passed: 79,
        assertions_total: 100,
      },
    },
  },
}

// ---------------------------------------------------------------------------
// useSchemaIterations
// ---------------------------------------------------------------------------

export const MOCK_SCHEMA_ITERATIONS: Record<string, SchemaIterationItem[]> = {
  "101:public": [
    {
      version: "v1",
      compliance_score: 4.1,
      framework_scores: { "1": { score: 3.8 }, "5": { score: 4.4 } },
    },
    {
      version: "v4",
      compliance_score: 6.2,
      framework_scores: { "1": { score: 5.8 }, "5": { score: 6.9 } },
    },
  ],
  "102:auth": [
    {
      version: "v1",
      compliance_score: 6.4,
      framework_scores: { "1": { score: 6.9 }, "3": { score: 5.8 }, "11": { score: 6.5 } },
    },
    {
      version: "v4",
      compliance_score: 8.1,
      framework_scores: { "1": { score: 8.8 }, "3": { score: 7.6 }, "11": { score: 7.9 } },
    },
  ],
}
