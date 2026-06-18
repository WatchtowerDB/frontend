import { useAssertionsByCheckIds } from "@/hooks/useAssertions"
import type { PaginatedResponse } from "@/types/api"
import type { AssertionItem } from "@/types/compliance"
import type { UseQueryResult } from "@tanstack/react-query"

// Please, ignore this file if you're reviewing it, robin.
// It is messy, it can not be cleared up for the mean time.
// It will properly be cleaned up down the branches, but its existence does not harm anything else.
// And I need it for the data aggregation used in the checks page.

// export interface CheckFilters {
//   client_db?: number
//   framework?: number
//   // Pagination & Sorting
//   page?: number
//   ordering?: string[]
// }

// For the bar chart in the compliance/summary page.
// export function useAssertionsSummary(frameworkId: number | null) {
//   const { data: clientDBsData, isLoading: isLoadingClientDBs } = useAllClientDBs()
//   const { data: checksData, isLoading: isLoadingChecks } = useAllChecks(
//     frameworkId ? { framework: frameworkId, ordering: "-id" } : {},
//   )

//   // For each client DB, find the latest check ID under the selected framework.
//   const getLatestCheckPerDB = () => {
//     if (!checksData?.results || !clientDBsData?.results || !frameworkId) return {}

//     // 1. Create a fast lookup map: O(N)
//     const latestChecksMap = new Map<number, number>()

//     for (const check of checksData.results) {
//       // If we haven't recorded this DB yet, it's the latest one!
//       if (!latestChecksMap.has(check.client_db)) {
//         latestChecksMap.set(check.client_db, check.id)
//       }
//     }

//     // 2. Build the final record: O(M)
//     return clientDBsData.results.reduce<Record<number, number>>((acc, db) => {
//       const latestCheckId = latestChecksMap.get(db.id)
//       if (latestCheckId !== undefined) {
//         acc[db.id] = latestCheckId
//       }
//       return acc
//     }, {})
//   }

//   // Trust the React Compiler to memoize this result automatically!
//   const latestCheckPerDB = getLatestCheckPerDB()

//   const latestCheckIds = Object.values(latestCheckPerDB)

//   // Fetch all assertions for all latest check IDs under this framework.
//   const {
//     data: assertionsData,
//     isLoading: isLoadingAssertions,
//     isError,
//   } = useAllAssertions(
//     frameworkId && latestCheckIds.length > 0 ? { compliance_framework: frameworkId } : {},
//   )

//   const chartData = useMemo(() => {
//     if (!assertionsData?.results || !clientDBsData?.results) return []
//     return clientDBsData.results
//       .filter((db) => latestCheckPerDB[db.id] !== undefined)
//       .map((db) => {
//         const checkId = latestCheckPerDB[db.id]
//         const dbAssertions = assertionsData.results.filter(
//           (a) => a.compliance_check === checkId && a.client_db === db.id,
//         )
//         const passed = dbAssertions.filter((a) => a.result === true).length
//         const failed = dbAssertions.filter((a) => a.result === false).length
//         return {
//           dbName: db.name,
//           passed,
//           failed,
//           total: dbAssertions.length,
//         }
//       })
//   }, [assertionsData, clientDBsData, latestCheckPerDB])

//   const isCalculating =
//     isLoadingChecks ||
//     isLoadingClientDBs ||
//     isLoadingAssertions ||
//     (frameworkId !== null && latestCheckIds.length === 0)

//   return {
//     chartData,
//     isCalculating,
//     isError,
//   }
// }

// For the line chart in the compliance/summary page.
// export function useAssertionsTrend(frameworkId: number | null) {
//   const { data: clientDBsData } = useAllClientDBs()
//   const { data: checksData, isLoading: isLoadingChecks } = useAllChecks(
//     frameworkId ? { framework: frameworkId, ordering: "id" } : {},
//   )

//   const checkIds = checksData?.results?.map((c) => c.id) ?? []
//   const assertionResults = useAssertionsByCheckIds(checkIds)

//   const isLoadingAssertions = assertionResults.some((r) => r.isLoading)
//   const isCalculating = isLoadingChecks || isLoadingAssertions

//   if (!checksData?.results || !clientDBsData?.results || assertionResults.some((r) => !r.data)) {
//     return { trendData: [], dbNames: [], isCalculating }
//   }

//   // 1. Map check ID to its assertions
//   const assertionsByCheckId = new Map(
//     checksData.results.map((check, i) => [check.id, assertionResults[i]?.data?.results ?? []]),
//   )

//   // 2. For each DB, build an ordered array of points (one per schema, sorted by schema ID)
//   const dbPointsMap = new Map<string, { failed: number; schema: number; date: string }[]>()

//   clientDBsData.results.forEach((db) => {
//     const dbChecks = checksData.results.filter((c) => c.client_db === db.id)

//     // Latest check per schema — last write wins since checks are ordered by id asc
//     const latestPerSchema = new Map<number, { checkId: number; date: string }>()
//     dbChecks.forEach((check) => {
//       latestPerSchema.set(check.schema, { checkId: check.id, date: check.date })
//     })

//     if (latestPerSchema.size === 0) return

//     const points = Array.from(latestPerSchema.entries())
//       .sort(([a], [b]) => a - b)
//       .map(([schemaId, { checkId, date }]) => {
//         const assertions = assertionsByCheckId.get(checkId) ?? []
//         const failed = assertions.filter((a) => a.result === false).length
//         return { schema: schemaId, failed, date }
//       })

//     dbPointsMap.set(db.name, points)
//   })

//   // 3. Find max iterations across all DBs
//   const maxIterations = Math.max(...Array.from(dbPointsMap.values()).map((p) => p.length), 0)

//   // 4. Pivot into flat array Recharts expects
//   const trendData: TrendDataPoint[] = Array.from({ length: maxIterations }, (_, i) => {
//     const point: TrendDataPoint = { iteration: i + 1 }
//     dbPointsMap.forEach((points, dbName) => {
//       if (points[i]) {
//         point[dbName] = {
//           failed: points[i].failed,
//           schema: points[i].schema,
//           date: points[i].date,
//         }
//       }
//     })
//     return point
//   })

//   const dbNames = Array.from(dbPointsMap.keys())

//   return {
//     trendData,
//     dbNames,
//     isCalculating,
//   }
// }

// Function to be used in the "view recent checks" and likely a future checks page.
// Returns the stats of given checkIds.
export function useAssertionsByChecks(checkIds: number[]) {
  const assertionResults: UseQueryResult<PaginatedResponse<AssertionItem>, Error>[] =
    useAssertionsByCheckIds(checkIds)

  const isLoading = assertionResults.some((r) => r.isLoading)
  const isError = assertionResults.some((r) => r.isError)

  // If any query is still missing data, return null immediately
  if (assertionResults.some((r) => !r.data)) {
    return { summary: null, isLoading, isError }
  }

  const summaryMap: Record<number, { passed: number; failed: number; total: number }> = {}

  assertionResults.forEach((query, index) => {
    const checkId = checkIds[index]
    const assertions = query.data?.results ?? []

    summaryMap[checkId] = {
      passed: assertions.filter((a) => a.result === true).length,
      failed: assertions.filter((a) => a.result === false).length,
      total: assertions.length,
    }
  })

  return { summaryMap, isLoading, isError }
}
