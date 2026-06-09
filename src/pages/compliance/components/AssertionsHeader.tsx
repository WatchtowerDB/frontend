import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-row items-center justify-between gap-1">
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
              className="p-2 text-red-500 transition-colors hover:text-red-700 disabled:text-slate-500 disabled:opacity-50 dark:hover:text-slate-100"
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
