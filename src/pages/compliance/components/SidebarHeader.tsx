import { Button } from "@/components/ui/button"
import { useState } from "react"
import RunCheckDialog from "./RunCheckDialog"

function SidebarHeader() {
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  return (
    <div>
      <Button variant={"outline"} onClick={() => setIsRunDialogOpen(true)}>
        Run Compliance Check
      </Button>
      <RunCheckDialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen} />
    </div>
  )
}

export default SidebarHeader
