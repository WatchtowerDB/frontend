import type { InferenceServerStatus } from "@/api/inference"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/ui/loader"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChecks } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAssertionsByChecks } from "@/hooks/useDataAggregation"
import { useFrameworks } from "@/hooks/useFrameworks"
import { useInferencePolling } from "@/hooks/useInferenceStatus"
import { cn, timeAgo } from "@/lib/utils"
import { useAssertionStore } from "@/stores/useAssertionStore"
import {
  ArrowRight,
  BrainCircuit,
  Cpu,
  Database,
  Loader2,
  Moon,
  Play,
  ShieldCheck,
  Sun,
  SunDim,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AssertionsStatus, type ViewState } from "../compliance/components/AssertionsStatus"
import RunCheckDialog from "../compliance/components/RunCheckDialog"

// Helpers
const passRate = (passed: number, total: number) =>
  total === 0 ? 0 : Math.round((passed / total) * 100)

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { greeting: "Good morning", Icon: Sun }
  if (hour < 18) return { greeting: "Good afternoon", Icon: SunDim }
  return { greeting: "Good evening", Icon: Moon }
}

const statusConfig: Record<ViewState, { borderColor: string; iconColor: string }> = {
  idle: { borderColor: "border-l-muted-foreground/40", iconColor: "text-muted-foreground/40" },
  fetching: { borderColor: "border-l-primary", iconColor: "text-primary" },
  streaming: { borderColor: "border-l-primary", iconColor: "text-primary" },
  complete: { borderColor: "border-l-emerald-500", iconColor: "text-emerald-500" },
  error: { borderColor: "border-l-destructive", iconColor: "text-destructive" },
}

const modelConfig: Record<
  InferenceServerStatus,
  { borderColor: string; iconColor: string; textColor: string; text: string }
> = {
  not_initialized: {
    // Fixed from "uninitialized"
    borderColor: "border-r-amber-500",
    iconColor: "text-amber-500",
    textColor: "text-amber-500",
    text: "Not initialized",
  },
  initializing: {
    // Fixed from "loading"
    borderColor: "border-r-primary",
    iconColor: "text-primary",
    textColor: "text-primary",
    text: "Initializing…",
  },
  initialized: {
    borderColor: "border-r-emerald-500",
    iconColor: "text-emerald-500",
    textColor: "text-emerald-500",
    text: "Ready",
  },
  error: {
    borderColor: "border-r-destructive",
    iconColor: "text-destructive",
    textColor: "text-destructive",
    text: "Failed to initialize",
  },
}

// Sub-components
const ResultBadge = ({ passed, total }: { passed: number; total: number }) => {
  const rate = passRate(passed, total)
  const variant = rate === 100 ? "success" : rate > 0 ? "warning" : "destructive"
  return <Badge variant={variant}>{rate}% passed</Badge>
}

// const dummyChecks = [
//   { id: 101, client_db: 4, framework: "soc2",     date: "2026-06-10T10:00:00Z" },
//   { id: 102, client_db: 3, framework: "iso27001", date: "2026-06-05T14:30:00Z" },
//   { id: 103, client_db: 2, framework: "hipaa",    date: "2026-05-20T09:15:00Z" },
//   { id: 104, client_db: 1, framework: "gdpr",     date: "2026-01-01T12:00:00Z" },
//   { id: 105, client_db: 2, framework: "soc2",     date: "2026-06-11T08:00:00Z" },
// ]

// const dummySummaryMap: Record<number, { passed: number; failed: number; total: number }> = {
//   101: { passed: 10, failed: 0,  total: 10 }, // 100% - Success!
//   102: { passed: 0,  failed: 5,  total: 5  }, // 0%   - Total Failure!
//   103: { passed: 7,  failed: 3,  total: 10 }, // 70%  - Partial
//   104: { passed: 2,  failed: 8,  total: 10 }, // 20%  - Partial (Mostly failing)
//   105: { passed: 15, failed: 0,  total: 15 }, // 100% - Success!
// }

export default function Dashboard() {
  // For the cards
  const navigate = useNavigate()
  const setCheckId = useAssertionStore((s) => s.setComplianceCheckId)
  const [runCheckOpen, setRunCheckOpen] = useState(false)
  const [complianceStatus, setComplianceStatus] = useState<ViewState>("idle")

  // Data fetching for the table
  const {
    data: checkData,
    isLoading: checkLoading,
    // isError: checkError,
    // isPlaceholderData,
  } = useChecks({ page: 1, ordering: ["-date"] })

  const { data: frameworks } = useFrameworks()
  const { data: clientDBs } = useAllClientDBs()
  const {
    data: inferenceData,
    isError: isNetworkError,
    refetch: refetchStatus,
    isFetching,
  } = useInferencePolling()

  const modelStatus: InferenceServerStatus = inferenceData?.status ?? "not_initialized"

  const currentCheckIds = checkData?.results?.map((check) => check.id) ?? []
  const { summaryMap } = useAssertionsByChecks(currentCheckIds)

  // Specifically for the framework & client DB names
  const frameworkMap = frameworks?.results
    ? Object.fromEntries(frameworks.results.map((f) => [f.id, f.name]))
    : {}
  const dbMap = clientDBs?.results
    ? Object.fromEntries(clientDBs.results.map((f) => [f.id, f.name]))
    : {}

  // const sorted = [...DUMMY_CHECKS].sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id))

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const { greeting, Icon } = getGreeting()

  // Derived Status
  const { borderColor, iconColor } = statusConfig[complianceStatus]
  const {
    borderColor: modelBorderColor,
    iconColor: modelIconColor,
    textColor: modelTextColor,
    text: modelStatusText,
  } = modelConfig[isNetworkError ? "error" : modelStatus]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-6">
      {/* Greeting & Time */}
      <div className="flex flex-row items-center">
        <div>
          <p className="text-muted-foreground text-xl">{formattedDate}</p>
          <h1 className="flex items-center gap-2 text-2xl font-medium">
            {greeting}, Admin
            <Icon size={20} />
          </h1>
          <p className="text-muted-foreground text-xl">Your compliance posture at a glance</p>
        </div>
      </div>
      {/* Information Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Compliance Check Card */}
        <Card className={cn("bg-muted/50 border-l-2", borderColor)}>
          <CardHeader className="flex flex-col gap-1 pb-2">
            <div className="flex w-full flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">Compliance status</CardTitle>
              <ShieldCheck className={cn("size-5", iconColor)} />
            </div>
            <AssertionsStatus textClassName="text-xs" onStatusChange={setComplianceStatus} />
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => setRunCheckOpen(true)}
            >
              <Play size={12} className="mr-1" /> Run check
            </Button>
          </CardContent>
        </Card>
        {/* Databases Card */}
        <Card
          className="hover:bg-muted group bg-muted/50 flex cursor-pointer flex-col transition-colors"
          onClick={() => navigate("/databases")}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Databases connected</CardTitle>
            <Database className="text-muted-foreground/40 size-5 transition-colors group-hover:text-blue-500" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pt-0">
            <p className="text-3xl font-medium">
              {clientDBs?.count ?? <Skeleton className="mb-2 h-4 w-20 bg-gray-300" />}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">registered databases</p>
          </CardContent>
        </Card>

        {/* Frameworks Card */}
        <Card
          className="hover:bg-muted group bg-muted/50 flex cursor-pointer flex-col transition-colors"
          onClick={() => navigate("/frameworks")}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Available frameworks</CardTitle>
            <Database className="text-muted-foreground/40 size-5 transition-colors group-hover:text-red-500" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pt-0">
            <p className="text-3xl font-medium">
              {frameworks?.count ?? <Skeleton className="mb-2 h-4 w-20 bg-gray-300" />}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">registered frameworks</p>
          </CardContent>
        </Card>

        {/* Model Status Card */}
        <Card
          className={cn("bg-muted/50 flex flex-col border-r-2 transition-colors", modelBorderColor)}
        >
          <CardHeader className="flex flex-col gap-1 pb-2">
            <div className="flex w-full flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">AI model</CardTitle>
              <BrainCircuit className={cn("size-5", modelIconColor)} />
            </div>
            <p className={cn("text-xs", modelTextColor)}>
              {isNetworkError ? "Model connection lost" : modelStatusText}
            </p>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col justify-between pt-0">
            {isNetworkError && (
              <Button
                size="sm"
                variant={"destructive"}
                className="w-full text-xs"
                onClick={() => refetchStatus()}
                disabled={isFetching || modelStatus === "initializing"}
              >
                <Cpu size={12} className="mr-1" />
                {isFetching ? (
                  <>
                    <Loader2 size={12} className="mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <Cpu size={12} className="mr-1" />
                    Retry Connection
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
        <RunCheckDialog open={runCheckOpen} onOpenChange={setRunCheckOpen} />
      </div>
      {/* Latest Checks Table */}
      <Card className="bg-muted/50 flex flex-1 flex-col">
        <CardHeader className="px- flex flex-row items-center justify-between border-b">
          <div className="space-y-0.5">
            <CardTitle className="text-foreground text-base font-semibold tracking-tight">
              Recent Compliance Checks
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Review the latest performed compliance runs
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => navigate("/compliance/checks")}
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {checkLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Database</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkData?.results?.slice(0, 5).map((check) => {
                  const stats = summaryMap?.[check.id]
                  return (
                    <TableRow
                      key={check.id}
                      className="h-5 cursor-pointer"
                      onClick={() => {
                        setCheckId([check.id])
                        navigate(`/compliance/assertions`)
                      }}
                    >
                      <TableCell className="text-muted-foreground">{check.id}</TableCell>
                      {/* Database */}
                      <TableCell className="text-muted-foreground">
                        {" "}
                        {dbMap[check.client_db] ? (
                          `${dbMap[check.client_db]}`
                        ) : (
                          <Skeleton className="mb-2 h-4 w-32" />
                        )}
                      </TableCell>
                      {/* Framework */}
                      <TableCell className="text-muted-foreground">
                        {" "}
                        {frameworkMap[check.framework] ? (
                          `${frameworkMap[check.framework]}`
                        ) : (
                          <Skeleton className="mb-2 h-4 w-32" />
                        )}
                      </TableCell>
                      {/* Date */}
                      <TableCell className="text-muted-foreground">
                        {timeAgo(new Date(check.date))}
                      </TableCell>
                      <TableCell className="text-right">
                        {stats ? (
                          <ResultBadge passed={stats.passed} total={stats.total} />
                        ) : (
                          <Skeleton className="ml-auto h-5 w-20" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
