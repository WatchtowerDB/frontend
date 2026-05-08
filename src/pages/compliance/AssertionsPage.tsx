import { GenericSidebar } from "@/components/GenericSidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import AssertionReport from "./components/AssertionReport"
import AssertionsList from "./components/AssertionsList"

// TODO: figure out how to make it so hovering over the very left side bar does NOT disable if the right bar is collapsed.
function AssertionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList onSelect={setSelectedId} selectedId={selectedId} />
        className={
          "w-[30vw] group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:border-0"
        }
      />
      <SidebarInset>
        {/* The actual page content */}
        <main className="p-6">
          <SidebarTrigger />
          <AssertionReport assertionId={selectedId} />
        </main>
      </SidebarInset>
    </div>
  )
}

export default AssertionsPage
