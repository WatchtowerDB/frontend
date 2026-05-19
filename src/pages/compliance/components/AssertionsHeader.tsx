import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { RefreshAssertionsButton } from "./RefreshAssertionsButton"
import RunCheckDialog from "./RunCheckDialog"

interface AssertionsHeaderProps {
  className?: string
}

export default function AssertionsHeader({ className }: AssertionsHeaderProps) {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  return (
    <div className={cn("w-full dark:bg-slate-900/50", className)}>
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
