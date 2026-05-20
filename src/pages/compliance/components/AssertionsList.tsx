import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAssertions } from "@/hooks/useAssertions"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useComplianceStream } from "@/hooks/useComplianceStream"
import { useFrameworks } from "@/hooks/useFrameworks"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"

interface AssertionListProps {
  onSelect?: (item: number) => void
  selectedId?: number | null
}

const AssertionsList = ({ onSelect, selectedId }: AssertionListProps) => {
  const { assertions, isLoading, isError, error, isFetching } = useAssertions()
  const activeCheckId = useComplianceCheckStore((s) => s.activeCheckId)
  const liveAssertions = useComplianceCheckStore((s) => s.liveAssertions)
  const phase = useComplianceCheckStore((s) => s.phase)

  // Used for differentiating between assertions.
  const { data: frameworks } = useFrameworks()
  const { data: clientDBs } = useAllClientDBs()
  const frameworkMap = frameworks?.results
    ? Object.fromEntries(frameworks.results.map((f) => [f.id, f.name]))
    : {}
  const clientdbMap = clientDBs?.results
    ? Object.fromEntries(clientDBs.results.map((f) => [f.id, f.name]))
    : {}

  useComplianceStream(activeCheckId) // opens SSE when a check is running

  if (isLoading) return <div className="animate-pulse p-4 text-xs">Scanning assertions...</div>
  if (isError)
    return <div className="text-destructive p-4 text-xs">Failed to load: {error.message}</div>

  return (
    <div className="relative flex flex-col">
      {isFetching && <div className="text-muted-foreground px-4 py-1 text-[10px]">Updating…</div>}
      {phase !== "idle" && phase !== "complete" && (
        <div className="text-muted-foreground animate-pulse px-4 py-1 text-[10px] capitalize">
          {phase}…
        </div>
      )}

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu
            className={`gap-1 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {assertions.map((item) => {
              const live = liveAssertions[item.id]
              const result =
                live?.status === "passed" ? true : live?.status === "failed" ? false : item.result

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={selectedId === item.id}
                    className="h-auto flex-col items-start gap-1 border-b p-0 last:border-b-0"
                  >
                    <button
                      onClick={() => onSelect?.(item.id)}
                      className={`flex w-full flex-col items-start gap-1 p-4 backdrop-blur-sm ${
                        result
                          ? "border-l-4 border-emerald-500 bg-linear-to-br from-emerald-500/15 via-emerald-500/5 via-10% to-transparent to-15%"
                          : "border-l-4 border-red-500 bg-linear-to-br from-red-500/15 via-red-500/5 via-10% to-transparent to-15%"
                      } ${selectedId === item.id ? "dark:bg-accent! bg-neutral-200/60!" : ""}`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="truncate text-left font-mono text-xs">
                          {item.id} • {item.sql_query}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-left text-[10px]">
                        Database: {clientdbMap[item.client_db] ?? "—"} • Framework:{" "}
                        {frameworkMap[item.compliance_framework] ?? "—"}
                        {/* const assertion = data?.results.find((a) => a.id === assertionId) */}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}

export default AssertionsList
