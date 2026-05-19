import { Button } from "@/components/ui/button"
import { useState } from "react"
import RunCheckDialog from "./RunCheckDialog"

export default function AssertionsHeader() {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  return (
    <div>
      <Button className={"w-full"} variant={"outline"} onClick={() => setIsRunDialogOpen(true)}>
        Run Compliance Check
      </Button>
      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}
