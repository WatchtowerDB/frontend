import { GenericSidebar } from "@/components/GenericSidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useAssertionStore } from "@/stores/useAssertionStore"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { useState } from "react"
import AssertionReport from "./components/AssertionReport"
import AssertionsFooter from "./components/AssertionsFooter"
import AssertionsHeader from "./components/AssertionsHeader"
import AssertionsList from "./components/AssertionsList"

function AssertionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const liveAssertions = useComplianceCheckStore((s) => s.liveAssertions)

  // These are to handle jumping to the currently streaming assertion.
  const streamingAssertionId =
    Number(
      Object.entries(liveAssertions).find(
        ([, a]) => !a.streamingDone && a.recommendation.length > 0,
      )?.[0],
    ) || null

  const handleJumpToStreaming = () => {
    if (!streamingAssertionId) return
    const checkId = liveAssertions[streamingAssertionId]?.checkId
    if (checkId) useAssertionStore.getState().setComplianceCheckId(checkId)
    setSelectedId(streamingAssertionId)
  }
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList onSelect={setSelectedId} selectedId={selectedId} />
        headerChildren=<AssertionsHeader
          onJumpToStreaming={handleJumpToStreaming}
          hasStreaming={!!streamingAssertionId}
        />
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
