import type { CheckFilters } from "@/api/check"
import { FilterPopover, type FilterGroup } from "@/components/FilterPopover"
import Pagination from "@/components/Pagination"
import { SelectedFilters } from "@/components/SelectedFilters"
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
import { useChecks } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAssertionsByChecks } from "@/hooks/useDataAggregation"
import { useFilterState } from "@/hooks/useFilterState"
import { useAllFrameworks } from "@/hooks/useFrameworks"
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
  ShieldAlert,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
  const {
    filters: filterValues,
    activeCount,
    toggle,
    reset,
    removeSingle,
  } = useFilterState(["client_db", "framework", "status"])

  const [pageState, setPageState] = useState<{ page: number; ordering: string[] | null }>({
    page: 1,
    ordering: ["-date"],
  })

  const handlePageChange = (newPage: number) => {
    setPageState((prev) => ({ ...prev, page: newPage }))
  }

  function handleToggle(key: string, id: number | string) {
    toggle(key, id)
    setPageState((prev) => ({ ...prev, page: 1 }))
  }

  const apiFilters: CheckFilters = {
    page: pageState.page,
    ordering: pageState.ordering ?? undefined,
    ...(filterValues.client_db?.length > 0 && {
      client_db: filterValues.client_db as unknown as number[],
    }),
    ...(filterValues.framework?.length > 0 && {
      framework: filterValues.framework as unknown as number[],
    }),
    ...(filterValues.status?.length > 0 && {
      status: filterValues.status as unknown as CheckStatus[],
    }),
  }

  const {
    data: checkData,
    isLoading: checkLoading,
    isError: checkError,
    isPlaceholderData,
  } = useChecks(apiFilters)

  const currentCheckIds = checkData?.results?.map((check) => check.id) ?? []

  // For data aggregation
  const { summaryMap, isLoading: isAssertionsLoading } = useAssertionsByChecks(currentCheckIds)

  // For check details & filtration listing
  const { data: dbs } = useAllClientDBs()
  const { data: frameworks } = useAllFrameworks()
  // const { data: schemas } = useAllClientDBSchemas({ latest: true })
  // TODO: implement that ^

  const frameworkMap = frameworks?.results
    ? Object.fromEntries(frameworks.results.map((f) => [f.id, f.name]))
    : {}

  const STATUS_OPTIONS: { id: CheckStatus; name: string }[] = [
    { id: "PENDING", name: "Pending" },
    { id: "GENERATING", name: "Generating" },
    { id: "EXECUTING", name: "Executing" },
    { id: "ANALYZING", name: "Analyzing" },
    { id: "COMPLETED", name: "Completed" },
    { id: "FAILED", name: "Failed" },
  ]

  const groups: FilterGroup[] = [
    {
      key: "framework",
      label: "Framework",
      icon: ShieldAlert,
      options: frameworks?.results?.map((f) => ({ id: f.id, name: f.name })) ?? [],
    },
    {
      key: "client_db",
      label: "Database",
      icon: Database,
      options: dbs?.results?.map((db) => ({ id: db.id, name: db.name })) ?? [],
    },
    {
      key: "status",
      label: "Status",
      icon: CheckCircle,
      options: STATUS_OPTIONS,
    },
  ]

  // For jumping to an assertion
  const setComplianceCheckId = useAssertionStore((s) => s.setComplianceCheckId)
  const navigate = useNavigate()

  // For pagination
  const totalCount = checkData?.count || 0
  const totalPages = Math.ceil(totalCount / (Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20))

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between">
        <header className="p-6">
          <h1 className="text-2xl font-bold">Compliance Checks</h1>
          <p className="text-foreground">View the history of all performed checks.</p>
        </header>

        <div className="flex items-center gap-2 px-6 pb-2">
          <FilterPopover
            groups={groups}
            filters={filterValues}
            onToggle={handleToggle}
            onReset={reset}
            activeCount={activeCount}
          />
          <SortsControls
            value={pageState.ordering ?? ["-date"]}
            onChange={(ordering) => setPageState((prev) => ({ ...prev, ordering, page: 1 }))}
            options={[
              { label: "Date", value: "date", icon: Calendar },
              { label: "Client DB", value: "client_db", icon: Database },
              { label: "Framework", value: "framework", icon: Box },
            ]}
          />
        </div>
      </div>

      <div className="px-6 pb-2">
        <SelectedFilters groups={groups} filters={filterValues} onToggle={removeSingle} />
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
                  const stats = summaryMap?.[check.id]
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

                  return (
                    <AccordionItem
                      key={check.id}
                      className="bg-accent w-full rounded-lg border px-4 font-mono text-xs backdrop-blur-sm"
                      value={String(check.id)}
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          {/* Context/Left Block */}
                          <div className="flex flex-col gap-2 text-left font-sans">
                            <p className="text-foreground ms-0.5 text-sm font-semibold">
                              {check ? (
                                <div className="flex items-center gap-2 text-sm">
                                  {/* ID Anchor*/}
                                  <span className="text-muted-foreground pt-0.5 font-mono text-xs font-bold">
                                    #{check.id}
                                  </span>

                                  {/* Database Indicator */}
                                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                                    <Database className="text-muted-foreground/70 h-3.5 w-3.5" />
                                    <span>{check.client_db_name}</span>
                                  </div>

                                  {/* Separator Dot */}
                                  <span className="text-muted-foreground/40 text-xs select-none">
                                    ·
                                  </span>

                                  {/* Framework Indicator */}
                                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                                    <ShieldAlert className="h-3.5 w-3.5 text-indigo-500/80" />
                                    <span>
                                      {frameworkMap[check.framework] ||
                                        `Framework: ${check.framework}`}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-5 w-10" />
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                              )}
                            </p>
                            <div className="flex flex-row items-center gap-1">
                              {statusBadge && !LIVE_CHECK_STATUSES.includes(check.status) && (
                                <Badge className={`${statusBadge.className} gap-1`}>
                                  <statusBadge.icon className="h-3 w-3" />
                                  {statusBadge.label}
                                </Badge>
                              )}
                              {stats && !LIVE_CHECK_STATUSES.includes(check.status) ? (
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
                          {["ANALYZING", "GENERATING", "EXECUTING"].includes(check?.status) ? (
                            <Disc3 className="h-6! w-6! shrink-0 animate-spin self-start pt-[1.1px] text-red-500" />
                          ) : check?.status === "PENDING" ? (
                            <Loader2 className="text-primary h-6! w-6! shrink-0 animate-spin self-start pt-[1.1px]" />
                          ) : null}
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
                          {/* Client Database Box */}
                          <div className="bg-card flex flex-col gap-1 rounded-lg p-3">
                            <span className="text-muted-foreground text-xs">client database</span>
                            {check.client_db_name ? (
                              <span className="text-sm font-medium">{check.client_db_name}</span>
                            ) : (
                              <Skeleton className="h-4 w-24" />
                            )}
                          </div>

                          {/* Framework Box */}
                          <div className="bg-card flex flex-col gap-1 rounded-lg p-3">
                            <span className="text-muted-foreground text-xs">framework</span>
                            {frameworkMap[check.framework] ? (
                              <span className="text-sm font-medium">
                                {frameworkMap[check.framework]}
                              </span>
                            ) : (
                              <Skeleton className="h-4 w-24" />
                            )}
                          </div>

                          {/* Schema Box */}
                          <div className="bg-card flex flex-col gap-1 rounded-lg p-3">
                            <span className="text-muted-foreground text-xs">schema</span>
                            {check.schema?.name ? (
                              <div className="flex w-full items-center justify-between pr-1">
                                <span className="text-sm font-medium">{check.schema.name}</span>
                                <span className="bg-muted text-muted-foreground border-border/50 ml-2 inline-flex w-9 shrink-0 items-center justify-center rounded-md border py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                                  v{check.schema.internal_version}
                                </span>
                              </div>
                            ) : (
                              <Skeleton className="h-4 w-24" />
                            )}
                          </div>

                          {/* User Box */}
                          <div className="bg-card flex flex-col gap-1 rounded-lg p-3">
                            <span className="text-muted-foreground text-xs">user</span>
                            {check.user ? (
                              <span className="text-sm font-medium">{check.user}</span>
                            ) : (
                              <Skeleton className="h-4 w-24" />
                            )}
                          </div>
                        </div>

                        <div className="text-muted-foreground flex flex-col items-center justify-between text-xs">
                          <Separator className="my-1" />
                          <div className="w-full">
                            {/* Pass rate bar & jump to assertions button */}
                            <div className="mt-2 flex items-center gap-4">
                              {/* Pass rate bar (passed/failed on assertions) */}
                              <div className="flex-1">
                                {stats && !LIVE_CHECK_STATUSES.includes(check.status) ? (
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
                                  setComplianceCheckId([check.id])
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
          page={apiFilters.page || 1}
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
