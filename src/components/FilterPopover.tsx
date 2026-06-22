import { ChevronRight, Filter, RotateCcw, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { ClearableInput } from "./ClearableInput"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

export type FilterGroup = {
  key: string
  label: string
  icon?: LucideIcon
  options: { id: number | string; name: string }[]
}

type FilterPopoverValues = Record<string, (number | string)[]>

type FilterPopoverProps = {
  groups: FilterGroup[]
  filters: FilterPopoverValues
  onToggle: (key: string, id: number | string) => void
  onReset: () => void
  activeCount: number
}

export function FilterPopover({
  groups,
  filters,
  onToggle,
  onReset,
  activeCount,
}: FilterPopoverProps) {
  const [search, setSearch] = useState("")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const normalize = (s: string) => s.toLowerCase()
  const isSearching = search.trim() !== ""

  function toggleGroupCollapse(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const visibleGroups = groups
    .map((group) => {
      const groupLabelMatches = normalize(group.label).includes(normalize(search))
      const options = groupLabelMatches
        ? group.options
        : group.options.filter((o) => normalize(o.name).includes(normalize(search)))

      // While searching, a group with visible options is always open.
      // Otherwise, respect whatever the user manually set.
      const isOpen = isSearching ? options.length > 0 : !collapsedGroups.has(group.key)

      return { ...group, options, isOpen }
    })
    .filter((group) => group.options.length > 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-xs">
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        {/* Search & Reset */}
        <div className="flex gap-2 p-3">
          <ClearableInput
            showClear={!!search}
            onClear={() => setSearch("")}
            placeholder="Search filters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw />
          </Button>
        </div>
        <Separator />

        {/* Groups */}
        <ScrollArea className="h-72">
          <div className="flex flex-col gap-4 p-3">
            {visibleGroups.map((group, index) => (
              <div key={group.key} className="flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-left"
                  onClick={() => toggleGroupCollapse(group.key)}
                >
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${group.isOpen ? "rotate-90" : ""}`}
                  />
                  {group.icon && (
                    <group.icon className="text-muted-foreground mb-0.5 h-3.5 w-3.5 shrink-0" />
                    // TODO: using mb-0.5 is a very bandaid way for me to center the icon. let's figure that out later yeah?
                  )}
                  <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {group.label}
                  </p>
                  {(filters[group.key]?.length ?? 0) > 0 && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      ({filters[group.key]?.length})
                    </span>
                  )}
                </button>

                {group.isOpen && (
                  <div className="flex flex-col gap-1">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`${group.key}-${option.id}`}
                          checked={filters[group.key]?.includes(option.id) ?? false}
                          onCheckedChange={() => onToggle(group.key, option.id)}
                        />
                        <label
                          htmlFor={`${group.key}-${option.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Separator between groups, not after the last one */}
                {index < visibleGroups.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />
      </PopoverContent>
    </Popover>
  )
}
