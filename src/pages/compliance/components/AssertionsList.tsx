import { Alert, AlertTitle } from "@/components/ui/alert"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAssertions } from "@/hooks/useAssertions"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useFrameworks } from "@/hooks/useFrameworks"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { Disc3, Loader2 } from "lucide-react"

interface AssertionListProps {
  onSelect?: (item: number) => void
  selectedId?: number | null
}

const AssertionsList = ({ onSelect, selectedId }: AssertionListProps) => {
  const { assertions, isLoading, isError, error, isFetching } = useAssertions()
  const liveAssertions = useComplianceCheckStore((s) => s.liveAssertions)

  // For assertion details
  const { data: frameworks } = useFrameworks()
  const { data: clientDBs } = useAllClientDBs()
  const frameworkMap = frameworks?.results
    ? Object.fromEntries(frameworks.results.map((f) => [f.id, f.name]))
    : {}
  const clientdbMap = clientDBs?.results
    ? Object.fromEntries(clientDBs.results.map((f) => [f.id, f.name]))
    : {}

  if (isLoading) return <div className="animate-pulse p-4 text-xs">Scanning assertions...</div>
  if (isError)
    return <div className="text-destructive p-4 text-xs">Failed to load: {error.message}</div>

  if (assertions.length === 0) {
    return (
      <div className="flex min-h-37.5 w-full flex-1 items-center justify-center p-4">
        <Alert
          variant="default"
          className="border-muted flex w-full max-w-60 flex-row items-center justify-center gap-2 bg-neutral-500/5 py-3 text-center backdrop-blur-xs"
        >
          <AlertTitle className="text-muted-foreground mb-0 pb-0 font-mono text-xs leading-none font-semibold tracking-wider uppercase">
            No Assertions Found
          </AlertTitle>
        </Alert>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu
            className={`gap-1 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {assertions.map((item) => {
              const live = liveAssertions[item.id]
              const isAssertionLoading = live && !live.streamingDone
              const isCurrentlyStreaming =
                live && !live.streamingDone && live.recommendation.length > 0
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
                      className={`flex w-full flex-row items-center justify-between p-4 text-left backdrop-blur-sm ${
                        // 1. Check for infrastructure execution FAILURE first
                        item?.status === "FAILED"
                          ? "border-l-4 border-zinc-500 bg-linear-to-br from-zinc-500/15 via-zinc-500/5 via-10% to-transparent to-15%"
                          : // 2. Fallback to standard compliance results if the execution didn't fail
                            result
                            ? "border-l-4 border-emerald-500 bg-linear-to-br from-emerald-500/15 via-emerald-500/5 via-10% to-transparent to-15%"
                            : "border-l-4 border-red-500 bg-linear-to-br from-red-500/15 via-red-500/5 via-10% to-transparent to-15%"
                      } ${selectedId === item.id ? "dark:bg-accent! bg-neutral-200/60!" : ""}`}
                      // TODO: Figure out why the hell is a CSS clash happening here. These are mutually exclusive..
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
                        <span className="truncate font-mono text-xs">
                          {item.id} • {item.sql_query}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          Check: {item.compliance_check} •{" "}
                          {clientdbMap[item.client_db] ? (
                            `Database: ${clientdbMap[item.client_db]}`
                          ) : (
                            <Skeleton className="mr-1 ml-1 inline-block h-3 w-20" />
                          )}{" "}
                          •{" "}
                          {frameworkMap[item.compliance_framework] ? (
                            `Framework: ${frameworkMap[item.compliance_framework]}`
                          ) : (
                            <Skeleton className="mr-1 ml-1 inline-block h-3 w-20" />
                          )}
                        </span>
                      </div>
                      {isCurrentlyStreaming && item.status !== "FAILED" ? (
                        <Disc3 className="h-6! w-6! shrink-0 animate-spin self-center text-red-500" />
                      ) : isAssertionLoading && item.status !== "FAILED" ? (
                        <Loader2 className="text-primary h-6! w-6! shrink-0 animate-spin self-center" />
                      ) : null}
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
