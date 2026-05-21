import { Button } from "@/components/ui/button"
import { useAssertions } from "@/hooks/useAssertions"
import { cn } from "@/lib/utils"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { useState } from "react"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"

interface AssertionsHeaderProps {
  className?: string
}

export default function AssertionsHeader({ className }: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  const { isLoading, isError, error, isFetching } = useAssertions()
  const phase = useComplianceCheckStore((s) => s.phase)
  return (
    <div className={cn("w-full", className)}>
      {isFetching && <h2 className="text-muted-foreground px-4 py-1 text-[10px]">Updating…</h2>}
      {phase !== "idle" && phase !== "complete" && (
        <h2 className="text-muted-foreground animate-pulse px-4 py-1 text-[10px] capitalize">
          {phase}…
        </h2>
      )}

      <div className="flex w-full flex-row items-center justify-between gap-2">
        <Button className="flex-1" variant="outline" onClick={() => setIsRunDialogOpen(true)}>
          Run Compliance Check
        </Button>
        <RefreshAssertionsButton />
      </div>

      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}
