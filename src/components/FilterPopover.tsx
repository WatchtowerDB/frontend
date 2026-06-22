import type { FilterValues } from "@/hooks/useFilterState"
import { useState } from "react"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

type FilterPopoverValues = Record<string, (number | string)[]>

export type FilterGroup = {
  key: string
  label: string
  options: { id: number | string; name: string }[]
}

type FilterPopoverProps = {
  groups: FilterGroup[]
  filters: FilterPopoverValues
  onToggle: (key: string, id: number | string) => void
  onReset: () => void
  activeCount?: number
}
// TODO: remember to remove the optional status of those

export function FilterPopover({
  groups,
  filters,
  onToggle,
  onReset,
  activeCount,
}: FilterPopoverProps) {
  const [search, setSearch] = useState("")

  const normalize = (s: string) => s.toLowerCase()
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      options: group.options.filter((o) => normalize(o.name).includes(normalize(search))),
    }))
    .filter((group) => group.options.length > 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* <Button variant="outline">Filters {activeCount > 0 && <Badge>{activeCount}</Badge>}</Button> */}
        <Button variant="default">
          <img src="/mambo/mambo.gif" className="h-5 w-16"></img>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        {/* ─── Search ───────────────────────────────────────────────── */}
        <div className="p-3">
          <Input
            placeholder="Search filters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Separator />

        {/* ─── Groups ───────────────────────────────────────────────── */}
        <ScrollArea className="h-72">
          <div className="flex flex-col gap-4 p-3">
            {visibleGroups.map((group, index) => (
              <div key={group.key} className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {group.label}
                </p>
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
                {/* Separator between groups, not after the last one */}
                {index < visibleGroups.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* ─── Reset ────────────────────────────────────────────────── */}
        {/* {activeCount > 0 && (
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        )} */}
        <div className="p-2">
          <Button variant="ghost" className="w-full" onClick={onReset}>
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
