import { GenericSidebar } from "@/components/GenericSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useState } from "react"
import AssertionReport from "./components/AssertionReport"
import AssertionsList from "./components/AssertionsList"

// TODO: figure out how to make it so hovering over the very left side bar does NOT disable if the right bar is collapsed.
function AssertionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  //         headerChildren= {<SidebarTrigger className="absolute top-0 left-0 z-50" />}
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList onSelect={setSelectedId} selectedId={selectedId} />
        className="w-[30vw] group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:border-0"
      />
      <SidebarInset className="min-h-0 flex-1 overflow-hidden">
        {/* The actual page content */}
        <main className="h-full p-6">
          <AssertionReport assertionId={selectedId} />
        </main>
      </SidebarInset>
    </div>
  )
}

export default AssertionsPage
