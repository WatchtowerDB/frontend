import { type AssertionFilters } from "@/api/assertions"
import { create } from "zustand"

export const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_COUNT) || 20
// This store is gorgeous.

interface AssertionFilterState {
  // --- Filter selections ---
  clientDb: number | null
  schema: number | null
  complianceFramework: number | null
  result: boolean | null

  // --- Search ---
  filterSearch: string
  assertionSearch: string

  // --- Pagination ---
  page: number
}

interface AssertionFilterActions {
  setClientDb: (id: number | null) => void
  setSchema: (id: number | null) => void
  setComplianceFramework: (id: number | null) => void
  setResult: (result: boolean | null) => void
  setFilterSearch: (query: string) => void
  setAssertionSearch: (query: string) => void
  setPage: (page: number) => void

  // Derives the AssertionFilters object the hook expects.
  getApiFilters: () => AssertionFilters & { page: number }

  // Resets filters.
  resetFilters: () => void
}

const initialFilterState: AssertionFilterState = {
  clientDb: null,
  schema: null,
  complianceFramework: null,
  result: null,
  filterSearch: "",
  assertionSearch: "",
  page: 1,
}

export const useAssertionStore = create<AssertionFilterState & AssertionFilterActions>(
  (set, get) => ({
    ...initialFilterState,

    // These setters change the page to 1 immediately.
    setClientDb: (id) => set({ clientDb: id, page: 1 }),
    setSchema: (id) => set({ schema: id, page: 1 }),
    setComplianceFramework: (id) => set({ complianceFramework: id, page: 1 }),
    setResult: (result) => set({ result, page: 1 }),

    // Search state does NOT reset page however, if needed, I will change that.
    setFilterSearch: (query) => set({ filterSearch: query }),
    setAssertionSearch: (query) => set({ assertionSearch: query }),

    setPage: (page) => set({ page }),

    getApiFilters: () => {
      const { clientDb, schema, complianceFramework, result, page } = get()
      return {
        // Only include a param if it has a value — the API treats
        // missing params as "no filter", which is what we want.
        ...(clientDb !== null && { client_db: clientDb }),
        ...(schema !== null && { schema }),
        ...(complianceFramework !== null && { compliance_framework: complianceFramework }),
        ...(result !== null && { result }),
        page,
      }
    },

    resetFilters: () =>
      set({
        clientDb: null,
        schema: null,
        complianceFramework: null,
        result: null,
        page: 1,
      }),
  }),
)
