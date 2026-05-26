import { GenericSidebar } from "@/components/GenericSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useState } from "react"
import AssertionReport from "./components/AssertionReport"
import AssertionsFooter from "./components/AssertionsFooter"
import AssertionsHeader from "./components/AssertionsHeader"
import AssertionsList from "./components/AssertionsList"

function AssertionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList onSelect={setSelectedId} selectedId={selectedId} />
        headerChildren=<AssertionsHeader />
        footerChildren=<AssertionsFooter />
        className="w-[30vw] group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:border-0"
      />
      <SidebarInset className="min-h-0 flex-1 overflow-hidden">
        {/* The actual page content */}
        <main className="h-full p-1">
          <AssertionReport assertionId={selectedId} />
        </main>
      </SidebarInset>
    </div>
  )
}

export default AssertionsPage
