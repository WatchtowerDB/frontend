import { useState } from "react"

export type FilterValues = Record<string, (number | string)[]>

export function useFilterState(initialKeys: string[]) {
  const empty: FilterValues = Object.fromEntries(initialKeys.map((k) => [k, []]))

  // State
  const [filters, setFilters] = useState<FilterValues>(empty)

  // Derived
  const activeCount = Object.values(filters).flat().length

  // Actions
  const toggle = (key: string, id: number | string) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((v) => v !== id) : [...prev[key], id],
    }))

  const reset = () => {
    setFilters(empty)
  }

  const removeSingle = (key: string, id: number | string) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key].filter((v) => v !== id) }))

  return { filters, activeCount, toggle, reset, removeSingle }
}
