import type { CheckFilters } from "@/api/check"
import Pagination from "@/components/Pagination"
import SortsControls from "@/components/SortsControls"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useChecks } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAssertionsByChecks } from "@/hooks/useDataAggregation"
import { useFrameworks } from "@/hooks/useFrameworks"
import { useAssertionStore } from "@/stores/useAssertionStore"
import type { Check, CheckStatus } from "@/types/compliance"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Box,
  Calendar,
  CheckCircle,
  Database,
  Disc3,
  Ellipsis,
  List,
  Loader2,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const mockChecks: Check[] = [
  {
    id: 1,
    framework: 1,
    schema: 101,
    client_db: 1,
    user: 5,
    date: new Date().toISOString(),
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  }, // -> success (failed === 0)
  {
    id: 2,
    framework: 1,
    schema: 102,
    client_db: 1,
    user: 5,
    date: new Date().toISOString(),
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  }, // -> success (failed === 0)
  {
    id: 3,
    framework: 1,
    schema: 103,
    client_db: 1,
    user: 6,
    date: new Date().toISOString(),
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  }, // -> failed (passed === 0)
  {
    id: 4,
    framework: 1,
    schema: 104,
    client_db: 1,
    user: 7,
    date: new Date().toISOString(),
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  }, // -> partial (mix)
  {
    id: 5,
    framework: 1,
    schema: 105,
    client_db: 1,
    user: 5,
    date: new Date().toISOString(),
    status: "COMPLETED",
    updated_at: new Date().toISOString(),
  }, // -> partial (mix)
  {
    id: 6,
    framework: 1,
    schema: 106,
    client_db: 1,
    user: 8,
    date: new Date().toISOString(),
    status: "PENDING",
    updated_at: new Date().toISOString(),
  }, // -> running
  {
    id: 7,
    framework: 1,
    schema: 107,
    client_db: 1,
    user: 5,
    date: new Date().toISOString(),
    status: "GENERATING",
    updated_at: new Date().toISOString(),
  }, // -> running
  {
    id: 8,
    framework: 1,
    schema: 108,
    client_db: 1,
    user: 9,
    date: new Date().toISOString(),
    status: "EXECUTING",
    updated_at: new Date().toISOString(),
  }, // -> running
  {
    id: 9,
    framework: 1,
    schema: 109,
    client_db: 1,
    user: 5,
    date: new Date().toISOString(),
    status: "ANALYZING",
    updated_at: new Date().toISOString(),
  }, // -> running
  {
    id: 10,
    framework: 1,
    schema: 110,
    client_db: 1,
    user: 10,
    date: new Date().toISOString(),
    status: "FAILED",
    updated_at: new Date().toISOString(),
  }, // -> incomplete (trumps everything else)
]
const mockSummaryMap: Record<number, { passed: number; failed: number; total: number }> = {
  1: { passed: 4, failed: 0, total: 4 },
  2: { passed: 1, failed: 0, total: 1 },
  3: { passed: 0, failed: 5, total: 5 },
  4: { passed: 2, failed: 1, total: 3 },
  // 5: intentionally omitted — simulates stats still loading for a COMPLETED check
}

function getCheckStatus(
  check: Check,
  stats?: { passed: number; failed: number; total: number },
): string {
  if (check.status === "FAILED") return "incomplete"
  if (check.status !== "COMPLETED") return "running"
  if (!stats) return "loading"
  if (stats.failed === 0) return "success"
  if (stats.passed === 0) return "failed"
  return "partial"
}

export default function ChecksPage() {
  // For filtering & handling the pages
  const [filters, setFilters] = useState<CheckFilters>({
    page: 1,
    ordering: ["-date"],
    client_db: undefined,
    framework: undefined,
  })
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }
  const {
    data: checkData,
    isLoading: checkLoading,
    isError: checkError,
    isPlaceholderData,
  } = useChecks(filters)
  const currentCheckIds = checkData?.results?.map((check) => check.id) ?? []

  // For data aggregation
  const { summaryMap, isLoading: isAssertionsLoading } = useAssertionsByChecks(currentCheckIds)

  // For check details
  const { data: frameworks } = useFrameworks()
  const { data: clientDBs } = useAllClientDBs()
  const frameworkMap = frameworks?.results
    ? Object.fromEntries(frameworks.results.map((f) => [f.id, f.name]))
    : {}
  const dbMap = clientDBs?.results
    ? Object.fromEntries(clientDBs.results.map((f) => [f.id, f.name]))
    : {}

  // For jumping to an assertion
  const setComplianceCheckId = useAssertionStore((s) => s.setComplianceCheckId)
  const navigate = useNavigate()

  // For pagination
  const totalCount = checkData?.count || 0
  const totalPages = Math.ceil(totalCount / (Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20))

  // TODO: If it's generating, it would not show most of these elements.
  // To be added when we get generating status on checks/assertions.
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between">
        <header className="p-6">
          <h1 className="text-2xl font-bold">Compliance Checks</h1>
          <p className="text-foreground">View the history of all performed checks.</p>
        </header>

        <div className="flex items-center gap-2 px-6 pb-2">
          <SortsControls
            value={filters.ordering ?? ["-date"]}
            onChange={(ordering) => setFilters((prev) => ({ ...prev, ordering, page: 1 }))}
            options={[
              { label: "Date", value: "date", icon: Calendar },
              { label: "Client DB", value: "client_db", icon: Database },
              { label: "Framework", value: "framework", icon: Box },
            ]}
          />
        </div>
      </div>

      <main className="flex min-h-0 w-full flex-1 flex-col gap-2">
        {checkLoading || isAssertionsLoading ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 text-sm">
            <Loader className="h-8 w-8 animate-spin items-center text-indigo-500" />
          </div>
        ) : checkError ? (
          // TODO: Maybe have a refresh button on the error. Probably put it on all lists in one commit at some point.
          <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 text-sm">
            <XCircle className="h-8 w-8 text-red-500" />
            Failed to load checks.
          </div>
        ) : checkData?.results?.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 text-sm">
            <List className="h-8 w-8" />
            No checks found.
          </div>
        ) : (
          <ScrollArea className="max-h-full min-h-0 flex-1">
            <div className="px-4 pb-4">
              <Accordion className="flex w-full flex-col gap-3" type="multiple">
                {checkData?.results.map((check) => {
                {/* {mockChecks?.map((check) => { */}
                  const stats = summaryMap?.[check.id]
                  // const stats = mockSummaryMap?.[check.id]
                  // const status = !stats
                  //   ? "loading"
                  //   : stats.failed === 0
                  //     ? "success"
                  //     : stats.passed === 0
                  //       ? "failed"
                  //       : "partial"
                  const status = getCheckStatus(check, stats)

                  const statusBadge = {
                    success: {
                      label: "All passed",
                      className: "bg-green-300 text-green-800",
                      icon: CheckCircle,
                    },
                    failed: {
                      label: "All failed",
                      className: "bg-red-300 text-red-800",
                      icon: XCircle,
                    },
                    partial: {
                      label: "Partial",
                      className: "bg-amber-100 text-amber-800",
                      icon: AlertTriangle,
                    },
                    loading: {
                      label: "Loading…",
                      className: "bg-muted text-muted-foreground animate-pulse",
                      icon: Ellipsis,
                    },
                    incomplete: {
                      label: "Incomplete",
                      className: "bg-amber-100 text-amber-800",
                      icon: AlertTriangle,
                    },
                  }[status]

                  const LIVE_CHECK_STATUSES: CheckStatus[] = [
                    "PENDING",
                    "GENERATING",
                    "EXECUTING",
                    "ANALYZING",
                  ]

                  if (LIVE_CHECK_STATUSES.includes(check.status)) {
                    // if (true) {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            key={check.id}
                            className="bg-accent/60 border-border/60 hover:bg-muted w-full cursor-pointer rounded-lg border px-4 font-mono text-xs backdrop-blur-sm"
                            onClick={() => {
                              setComplianceCheckId(check.id)
                              navigate("/compliance/assertions")
                            }}
                          >
                            {/* Mirroring the AccordionTrigger layout exactly */}
                            <div className="flex flex-1 items-center justify-between py-4 pr-8">
                              {/* Context/Left Block */}
                              <div className="flex flex-col gap-1 text-left font-sans">
                                <div className="flex flex-row items-center gap-4">
                                  <p className="text-foreground/70 ms-0.5 text-sm font-semibold">
                                    {dbMap[check.client_db] && frameworkMap[check.framework] ? (
                                      `${dbMap[check.client_db]} · ${frameworkMap[check.framework]}`
                                    ) : (
                                      <Skeleton className="mb-2 h-4 w-32" />
                                    )}
                                  </p>
                                  {["ANALYZING", "GENERATING", "EXECUTING"].includes(
                                    check?.status,
                                  ) ? (
                                    <Disc3 className="h-6! w-6! shrink-0 animate-spin self-center text-red-500" />
                                  ) : check?.status === "PENDING" ? (
                                    <Loader2 className="text-primary h-6! w-6! shrink-0 animate-spin self-center" />
                                  ) : null}
                                </div>
                                <div className="flex flex-row items-center gap-1">
                                  {/* Ghost Placeholder Skeleton representing incoming data stats */}
                                  <Skeleton className="bg-muted/40 h-5 w-24" />
                                </div>
                              </div>

                              {/* Far Right Block: Badge ID & Loading */}
                              <span className="text-muted-foreground/50 self-start pt-[1.1px] font-mono text-xs">
                                #{check.id}
                              </span>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Jump to assertion</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <AccordionItem
                      key={check.id}
                      className="bg-accent w-full rounded-lg border px-4 font-mono text-xs backdrop-blur-sm"
                      value={String(check.id)}
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          {/* Context/Left Block */}
                          <div className="flex flex-col gap-1 text-left font-sans">
                            <p className="text-foreground ms-0.5 text-sm font-semibold">
                              {dbMap[check.client_db] ? (
                                `${dbMap[check.client_db]} · ${frameworkMap[check.framework]}`
                              ) : (
                                <Skeleton className="mb-2 h-4 w-32" />
                              )}
                            </p>
                            <div className="flex flex-row items-center gap-1">
                              {statusBadge && (
                                <Badge className={`${statusBadge.className} gap-1`}>
                                  <statusBadge.icon className="h-3 w-3" />
                                  {statusBadge.label}
                                </Badge>
                              )}
                              {stats ? (
                                <>
                                  {stats.passed > 0 && (
                                    <Badge className="gap-1 bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3" />
                                      {stats.passed} passed
                                    </Badge>
                                  )}
                                  {stats.failed > 0 && (
                                    <Badge className="gap-1 bg-red-100 text-red-800">
                                      <XCircle className="h-3 w-3" />
                                      {stats.failed} failed
                                    </Badge>
                                  )}
                                  <Badge className="bg-secondary text-secondary-foreground gap-1">
                                    <List className="h-3 w-3" />
                                    {stats.total} total
                                  </Badge>
                                </>
                              ) : (
                                <Skeleton className="h-5 w-24" />
                              )}
                            </div>
                          </div>
                          {/* On the far right end of a check, it shows check ID */}
                          {/* <span className="text-muted-foreground self-start pt-[1.1px] font-mono text-xs">
                              #{check.id}
                            </span> */}
                          <Button
                            className="self-start pt-[1.1px]"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setComplianceCheckId(check.id)
                              navigate("/compliance/assertions")
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="h-full px-4 pb-4">
                        {/* Date */}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(check.date).toLocaleString()}
                        </div>
                        {check?.status === "FAILED" && (
                          <Alert
                            variant="destructive"
                            className="mt-2 flex items-start gap-4 bg-red-700 p-4 text-white"
                          >
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                            <div className="flex-1 space-y-1">
                              <AlertTitle className="font-semibold tracking-wide">
                                Incomplete Check
                              </AlertTitle>
                              <AlertDescription className="text-sm leading-relaxed text-white opacity-90">
                                This check is incomplete and should not be reviewed. It is highly
                                recommended to rerun the check using the same parameters.
                              </AlertDescription>
                            </div>
                          </Alert>
                        )}
                        <Separator className="my-1" />
                        {/* General Info */}
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            {
                              label: "client database",
                              name: dbMap[check.client_db],
                            },
                            {
                              label: "framework",
                              name: frameworkMap[check.framework],
                            },
                            {
                              label: "schema",
                              name: check.schema,
                            },
                            {
                              label: "user",
                              name: check.user,
                            },
                          ].map(({ label, name }) => (
                            <div key={label} className="bg-card flex flex-col gap-1 rounded-lg p-3">
                              <span className="text-muted-foreground text-xs">{label}</span>
                              {name ? (
                                <span className="text-sm font-medium">{name}</span>
                              ) : (
                                <Skeleton className="h-4 w-24" />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="text-muted-foreground flex flex-col items-center justify-between text-xs">
                          <Separator className="my-1" />
                          <div className="w-full">
                            {/* Pass rate bar & jump to assertions button */}
                            <div className="mt-2 flex items-center gap-4">
                              {/* Pass rate bar (passed/failed on assertions) */}
                              <div className="flex-1">
                                {stats ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span>Pass rate</span>
                                      <span>{Math.round((stats.passed / stats.total) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-red-800">
                                      <div
                                        className={`h-1.5 rounded-full ${status === "success" ? "bg-green-500" : status === "failed" ? "bg-red-500" : "bg-amber-500"}`}
                                        style={{
                                          width: `${Math.round((stats.passed / stats.total) * 100)}%`,
                                        }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <Skeleton className="h-4 w-full" />
                                )}
                              </div>
                              {/* Jump to assertions button */}
                              <Button
                                className="self-center"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setComplianceCheckId(check.id)
                                  navigate("/compliance/assertions")
                                }}
                              >
                                Jump to assertions
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          </ScrollArea>
        )}
      </main>

      {/* Pagination */}
      <div className="bg-background border-t p-4">
        <Pagination
          page={filters.page || 1}
          totalPages={totalPages}
          totalCount={totalCount}
          isFetching={isPlaceholderData}
          onPageChange={handlePageChange}
          size="sm"
        />
      </div>
    </div>
  )
}
