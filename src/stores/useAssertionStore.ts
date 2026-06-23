import { type AssertionFilters } from "@/api/assertions"
import type { AssertionStatus } from "@/types/compliance"
import { create } from "zustand"

export const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
// This store is gorgeous.

export type AssertionFilterKey =
  | "clientDb"
  | "schema"
  | "complianceFramework"
  | "complianceCheckId"
  | "status"

type FilterId = number | string

interface AssertionFilterState {
  // --- Filter selections ---
  clientDb: number[]
  schema: number[]
  complianceFramework: number[]
  complianceCheckId: number[]
  status: AssertionStatus[]
  result: boolean | null

  // --- Search ---
  filterSearch: string
  assertionSearch: string

  // --- Pagination & Sorting ---
  page: number
  ordering: string[] | null
}

interface AssertionFilterActions {
  setClientDb: (ids: number[]) => void
  setSchema: (ids: number[]) => void
  setComplianceFramework: (ids: number[]) => void
  setComplianceCheckId: (ids: number[]) => void
  setStatus: (statuses: AssertionStatus[]) => void
  setResult: (result: boolean | null) => void
  setFilterSearch: (query: string) => void
  setAssertionSearch: (query: string) => void
  setPage: (page: number) => void
  setOrdering: (ordering: string[] | null) => void

  toggleClientDb: (id: number) => void
  toggleSchema: (id: number) => void
  toggleComplianceFramework: (id: number) => void
  toggleComplianceCheckId: (id: number) => void
  toggleStatus: (status: AssertionStatus) => void

  // Derives the AssertionFilters object the hook expects.
  getApiFilters: () => AssertionFilters & { page: number }

  // Resets filters.
  resetFilters: () => void
}

const initialFilterState: AssertionFilterState = {
  clientDb: [],
  schema: [],
  complianceFramework: [],
  complianceCheckId: [],
  status: [],
  result: null,
  filterSearch: "",
  assertionSearch: "",
  page: 1,
  ordering: null,
}

export const useAssertionStore = create<AssertionFilterState & AssertionFilterActions>(
  (set, get) => ({
    ...initialFilterState,

    // These setters change the page to 1 immediately.
    setClientDb: (ids: number[]) => set({ clientDb: ids, page: 1 }),
    setSchema: (ids: number[]) => set({ schema: ids, page: 1 }),
    setComplianceFramework: (ids: number[]) => set({ complianceFramework: ids, page: 1 }),
    setComplianceCheckId: (ids: number[]) => set({ complianceCheckId: ids, page: 1 }),
    setStatus: (statuses: AssertionStatus[]) => set({ status: statuses, page: 1 }),

    toggleClientDb: (id) =>
      set((state) => ({
        clientDb: state.clientDb.includes(id)
          ? state.clientDb.filter((x) => x !== id)
          : [...state.clientDb, id],
        page: 1,
      })),

    toggleSchema: (id) =>
      set((state) => ({
        schema: state.schema.includes(id)
          ? state.schema.filter((x) => x !== id)
          : [...state.schema, id],
        page: 1,
      })),

    toggleComplianceFramework: (id) =>
      set((state) => ({
        complianceFramework: state.complianceFramework.includes(id)
          ? state.complianceFramework.filter((x) => x !== id)
          : [...state.complianceFramework, id],
        page: 1,
      })),

    toggleComplianceCheckId: (id) =>
      set((state) => ({
        complianceCheckId: state.complianceCheckId.includes(id)
          ? state.complianceCheckId.filter((x) => x !== id)
          : [...state.complianceCheckId, id],
        page: 1,
      })),

    toggleStatus: (status) =>
      set((state) => ({
        status: state.status.includes(status)
          ? state.status.filter((x) => x !== status)
          : [...state.status, status],
        page: 1,
      })),

    // Search state does NOT reset page however, if needed, I will change that.
    setResult: (result) => set({ result, page: 1 }),
    setFilterSearch: (query) => set({ filterSearch: query }),
    setAssertionSearch: (query) => set({ assertionSearch: query }),

    setPage: (page) => set({ page }),
    setOrdering: (ordering) => set({ ordering }),

    getApiFilters: () => {
      const {
        clientDb,
        schema,
        complianceFramework,
        complianceCheckId,
        status,
        result,
        page,
        ordering,
      } = get()

      return {
        // Only include a param if it has a value — the API treats
        // missing params as "no filter", which is what we want.
        ...(clientDb.length > 0 && { client_db: clientDb }),
        ...(schema.length > 0 && { schema }),
        ...(complianceFramework.length > 0 && {
          compliance_framework: complianceFramework,
        }),
        ...(complianceCheckId.length > 0 && {
          check: complianceCheckId,
        }),
        ...(status.length > 0 && { status }),
        ...(result !== null && { result }),
        ...(ordering !== null && { ordering }),
        page,
      }
    },

    resetFilters: () =>
      set({
        clientDb: [],
        schema: [],
        complianceFramework: [],
        complianceCheckId: [],
        status: [],
        result: null,
        page: 1,
      }),
  }),
)

export function useAssertionFilterMap(): Record<
  AssertionFilterKey,
  [FilterId[], (id: FilterId) => void]
> {
  const clientDb = useAssertionStore((s) => s.clientDb)
  const schema = useAssertionStore((s) => s.schema)
  const complianceFramework = useAssertionStore((s) => s.complianceFramework)
  const complianceCheckId = useAssertionStore((s) => s.complianceCheckId)
  const status = useAssertionStore((s) => s.status)

  const toggleClientDb = useAssertionStore((s) => s.toggleClientDb)
  const toggleSchema = useAssertionStore((s) => s.toggleSchema)
  const toggleComplianceFramework = useAssertionStore((s) => s.toggleComplianceFramework)
  const toggleComplianceCheckId = useAssertionStore((s) => s.toggleComplianceCheckId)
  const toggleStatus = useAssertionStore((s) => s.toggleStatus)

  return {
    clientDb: [clientDb, toggleClientDb as (id: FilterId) => void],
    schema: [schema, toggleSchema as (id: FilterId) => void],
    complianceFramework: [complianceFramework, toggleComplianceFramework as (id: FilterId) => void],
    complianceCheckId: [complianceCheckId, toggleComplianceCheckId as (id: FilterId) => void],
    status: [status, toggleStatus as (id: FilterId) => void],
  }
}
