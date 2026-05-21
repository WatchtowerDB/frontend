import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AssertionsStatus } from "./AssertionsStatus"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"

interface AssertionsHeaderProps {
  className?: string
}

// type ViewState = "idle" | "fetching" | "streaming" | "complete" | "error"

export default function AssertionsHeader({ className }: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  // const { isLoading, isError, error, isFetching } = useAssertions()
  // const phase = useComplianceCheckStore((s) => s.phase)

  // const viewState: ViewState = (() => {
  //   if (isFetching) return "fetching"
  //   if (phase !== "idle" && phase !== "complete") return "streaming"
  //   if (phase === "complete") return "complete"
  //   return "idle"
  // })()

  return (
    <div className={cn("w-full", className)}>
      <AssertionsStatus />
      {/* {viewState === "fetching" && (
        <h2 className="text-muted-foreground animate-pulse px-4 py-1 text-[10px]">Updating…</h2>
      )}
      {viewState === "streaming" && (
        <h2 className="text-muted-foreground animate-pulse px-4 py-1 text-[10px] capitalize">
          {phase}…
        </h2>
      )} */}

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
