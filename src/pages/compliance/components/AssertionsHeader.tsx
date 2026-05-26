import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AssertionsStatus } from "./AssertionsStatus"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"
import ViewLatestCheck from "./ViewLatestCheck"

interface AssertionsHeaderProps {
  className?: string
}

export default function AssertionsHeader({ className }: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <Button className="flex-1" variant="outline" onClick={() => setIsRunDialogOpen(true)}>
          Run Compliance Check
        </Button>
        <RefreshAssertionsButton />
      </div>
      <AssertionsStatus />
      <ViewLatestCheck className="mt-3" />

      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}
