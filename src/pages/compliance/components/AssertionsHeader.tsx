import { FilterPopover, type FilterGroup } from "@/components/FilterPopover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useAllFrameworks } from "@/hooks/useFrameworks"
import { cn } from "@/lib/utils"
import { useAssertionStore } from "@/stores/useAssertionStore"
import { FastForward } from "lucide-react"
import { useState } from "react"
import { AssertionsStatus } from "./AssertionsStatus"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"
import ViewLatestCheck from "./ViewLatestCheck"

interface AssertionsHeaderProps {
  className?: string
  onJumpToStreaming?: () => void
  hasStreaming?: boolean
}

export default function AssertionsHeader({
  className,
  onJumpToStreaming,
  hasStreaming,
}: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)

  const clientDb = useAssertionStore((s) => s.clientDb)
  const schema = useAssertionStore((s) => s.schema)
  const complianceFramework = useAssertionStore((s) => s.complianceFramework)
  const setClientDb = useAssertionStore((s) => s.setClientDb)
  const resetFilters = useAssertionStore((s) => s.resetFilters)

  const { data: dbs } = useAllClientDBs()
  const { data: frameworks } = useAllFrameworks()
  const { data: schemas } = useAllClientDBSchemas()

  const groups: FilterGroup[] = [
    {
      key: "compliance_framework",
      label: "Framework",
      options: frameworks?.results?.map((f) => ({ id: f.id, name: f.name })) ?? [],
    },
    {
      key: "client_db",
      label: "Database",
      options: dbs?.results?.map((db) => ({ id: db.id, name: db.name })) ?? [],
    },
    {
      key: "schema",
      label: "Schema",
      options: schemas?.results?.map((s) => ({ id: s.id, name: `Schema #${s.id}` })) ?? [],
    },
  ]

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-row items-center justify-between gap-1">
        <FilterPopover
          groups={groups}
          // filters={{ client_db: clientDb, schema, compliance_framework: complianceFramework }}
          // onToggle={handleToggle}
          onReset={resetFilters}
          // activeCount={activeCount}
        />
        <Button className="flex-1" variant="default" onClick={() => setIsRunDialogOpen(true)}>
          Run Compliance Check
        </Button>
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
      <AssertionsStatus />
      <ViewLatestCheck className="mt-3" />

      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}
