import { FilterPopover, type FilterGroup } from "@/components/FilterPopover"
import { SelectedFilters } from "@/components/SelectedFilters"
import SortsControls from "@/components/SortsControls"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useAllFrameworks } from "@/hooks/useFrameworks"
import { cn } from "@/lib/utils"
import {
  useAssertionFilterMap,
  useAssertionStore,
  type AssertionFilterKey,
} from "@/stores/useAssertionStore"
import { Activity, Database, FastForward, Network, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { AssertionsStatus } from "./AssertionsStatus"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"

interface AssertionsHeaderProps {
  className?: string
  onJumpToStreaming?: () => void
  hasStreaming?: boolean
}

const STATUS_OPTIONS = [
  { id: "PENDING", name: "Pending" },
  { id: "ANALYZING", name: "Analyzing" },
  { id: "EXECUTING", name: "Executing" },
  { id: "COMPLETED", name: "Completed" },
  { id: "FAILED", name: "Failed" },
]

export default function AssertionsHeader({
  className,
  onJumpToStreaming,
  hasStreaming,
}: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)

  // Filtration & Sorting
  const filterMap = useAssertionFilterMap()
  const ordering = useAssertionStore((s) => s.ordering)
  const setOrdering = useAssertionStore((s) => s.setOrdering)
  const resetFilters = useAssertionStore((s) => s.resetFilters)

  const { data: dbs } = useAllClientDBs()
  const { data: frameworks } = useAllFrameworks()
  const { data: schemas } = useAllClientDBSchemas({ latest: true })

  const groups: FilterGroup[] = [
    {
      key: "complianceFramework",
      label: "Framework",
      icon: ShieldAlert,
      options: frameworks?.results?.map((f) => ({ id: f.id, name: f.name })) ?? [],
    },
    {
      key: "clientDb",
      label: "Database",
      icon: Database,
      options: dbs?.results?.map((db) => ({ id: db.id, name: db.name })) ?? [],
    },
    {
      key: "schema",
      label: "Schema",
      icon: Network,
      options:
        schemas?.results?.map((s) => ({
          id: s.id,
          name: s.internal_version ? `${s.name} v${s.internal_version}` : s.name,
        })) ?? [],
    },
    {
      key: "status",
      label: "Status",
      icon: Activity,
      options: STATUS_OPTIONS,
    },
  ]

  const filters = Object.fromEntries(Object.entries(filterMap).map(([key, [arr]]) => [key, arr]))

  const activeFilterCount = Object.values(filterMap).reduce((sum, [arr]) => sum + arr.length, 0)

  function handleToggle(key: string, id: number | string) {
    filterMap[key as AssertionFilterKey][1](id)
  }

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="flex w-full flex-row items-start justify-between gap-1">
        <div className="flex flex-1 flex-col items-start">
          <Button variant="default" className="w-full" onClick={() => setIsRunDialogOpen(true)}>
            Run Compliance Check
          </Button>
          <AssertionsStatus className="-mt-1" />
        </div>
        <RefreshAssertionsButton />
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              onClick={onJumpToStreaming}
              variant={"default"}
              disabled={!hasStreaming}
              className="disabled:text-foreground p-2 text-red-500 transition-colors hover:text-red-700 disabled:opacity-50 dark:hover:text-red-500"
              aria-label="Jump to running assertion"
            >
              <FastForward />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Jump to Streaming Asssertion</TooltipContent>
        </Tooltip>
      </div>
      {/* <ViewLatestCheck className="mt-3" /> */}
      {/* Filters & Sorting*/}
      <div className="flex flex-row items-center gap-3">
        <FilterPopover
          groups={groups}
          filters={filters}
          onToggle={handleToggle}
          onReset={resetFilters}
          activeCount={activeFilterCount}
        />
        <div className="bg-border h-6 w-px shrink-0" />
        <SortsControls
          size="xs"
          allowEmptySort={true}
          value={ordering ?? []}
          onChange={(newOrdering) => setOrdering(newOrdering)}
          options={[
            { label: "Status", value: "status", icon: Activity },
            { label: "Client DB", value: "client_db", icon: Database },
          ]}
        />
      </div>
      <SelectedFilters groups={groups} filters={filters} onToggle={handleToggle} />
      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}
