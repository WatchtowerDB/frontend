import { X } from "lucide-react"
import { useState } from "react"
import type { FilterGroup } from "./FilterPopover"
import { Badge } from "./ui/badge"

type FilterPopoverValues = Record<string, (number | string)[]>

type SelectedFiltersProps = {
  groups: FilterGroup[]
  filters: FilterPopoverValues
  onToggle: (key: string, id: number | string) => void
}

export function SelectedFilters({ groups, filters, onToggle }: SelectedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const allChips = groups
    .flatMap((group) =>
      (filters[group.key] ?? []).map((id) => {
        const option = group.options.find((o) => o.id === id)
        if (!option) return null
        return { groupKey: group.key, id, name: option.name, icon: group.icon }
      }),
    )
    .filter((chip): chip is NonNullable<typeof chip> => chip !== null)

  if (allChips.length === 0) return null

  const LIMIT = 5
  const hasOverflow = allChips.length > LIMIT
  const visibleChips = isExpanded ? allChips : allChips.slice(0, LIMIT)
  const remainingCount = allChips.length - LIMIT

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {visibleChips.map((chip) => (
        <Badge
          key={`${chip.groupKey}-${chip.id}`}
          variant="secondary"
          className="bg-muted/50 hover:bg-muted border-muted-foreground/10 text-foreground flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium tracking-tight shadow-sm transition-all duration-200"
        >
          {chip.icon && (
            <chip.icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          )}
          
          <span className="leading-none">{chip.name}</span>
          
          <button
            type="button"
            onClick={() => onToggle(chip.groupKey, chip.id)}
            className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground -mr-1 ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-md p-0 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label={`Remove ${chip.name} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Overflow button */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted font-mono text-[11px] font-semibold tracking-tight px-2 py-0.5 rounded-md border border-dashed border-muted-foreground/20 transition-all cursor-pointer h-5 inline-flex items-center"
        >
          {isExpanded ? "Show less" : `and ${remainingCount} more`}
        </button>
      )}
    </div>
  )
}