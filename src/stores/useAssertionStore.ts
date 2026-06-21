import { type AssertionFilters } from "@/api/assertions"
import { create } from "zustand"

export const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
// This store is gorgeous.

interface AssertionFilterState {
  // --- Filter selections ---
  clientDb: number[]
  schema: number[]
  complianceFramework: number[]
  complianceCheckId: number[]
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
  setResult: (result: boolean | null) => void
  setFilterSearch: (query: string) => void
  setAssertionSearch: (query: string) => void
  setPage: (page: number) => void
  setOrdering: (ordering: string[] | null) => void

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

    // Search state does NOT reset page however, if needed, I will change that.
    setResult: (result) => set({ result, page: 1 }),
    setFilterSearch: (query) => set({ filterSearch: query }),
    setAssertionSearch: (query) => set({ assertionSearch: query }),

    setPage: (page) => set({ page }),
    setOrdering: (ordering) => set({ ordering }),

    getApiFilters: () => {
      const { clientDb, schema, complianceFramework, complianceCheckId, result, page, ordering } =
        get()

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
        result: null,
        page: 1,
      }),
  }),
)
