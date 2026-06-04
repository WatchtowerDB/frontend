import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLatestCheck } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useFrameworks } from "@/hooks/useFrameworks"
import { cn } from "@/lib/utils"
import { useAssertionStore } from "@/stores/useAssertionStore"
import {
  ArrowRight,
  ArrowUpDown,
  BrainCircuit,
  Cpu,
  Database,
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

const DUMMY_CHECKS = [
  {
    id: 7,
    framework: "HIPAA v2024",
    database: "prod-us-east",
    date: "2026-06-03",
    passed: 26,
    total: 30,
  },
  {
    id: 6,
    framework: "SOC 2 Type II",
    database: "analytics-db",
    date: "2026-06-02",
    passed: 11,
    total: 18,
  },
  {
    id: 5,
    framework: "GDPR 2018",
    database: "eu-customers",
    date: "2026-06-01",
    passed: 17,
    total: 18,
  },
  {
    id: 4,
    framework: "HIPAA v2024",
    database: "prod-us-east",
    date: "2026-05-28",
    passed: 22,
    total: 30,
  },
  {
    id: 3,
    framework: "SOC 2 Type II",
    database: "analytics-db",
    date: "2026-05-25",
    passed: 15,
    total: 18,
  },
]

const passRate = (passed: number, total: number) => Math.round((passed / total) * 100)

const ResultBadge = ({ passed, total }: { passed: number; total: number }) => {
  const rate = passRate(passed, total)
  const variant = rate >= 80 ? "default" : rate >= 60 ? "outline" : "destructive"
  return <Badge variant={variant}>{rate}% pass</Badge>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [sortAsc, setSortAsc] = useState(false)
  const [runCheckOpen, setRunCheckOpen] = useState(false)
  const [complianceStatus, setComplianceStatus] = useState<ViewState>("idle")

  const setClientDb = useAssertionStore((s) => s.setClientDb)
  const { data: dbs } = useAllClientDBs()
  const { data: frameworks } = useFrameworks()
  const { data: latestCheck } = useLatestCheck()

  const sorted = [...DUMMY_CHECKS].sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id))
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { greeting: "Good morning", Icon: Sun }
    if (hour < 18) return { greeting: "Good afternoon", Icon: SunDim }
    return { greeting: "Good evening", Icon: Moon }
  }
  const { greeting, Icon } = getGreeting()

  const statusConfig: Record<ViewState, { borderColor: string; iconColor: string }> = {
    idle: { borderColor: "border-l-muted-foreground/40", iconColor: "text-muted-foreground/40" },
    fetching: { borderColor: "border-l-primary", iconColor: "text-primary" },
    streaming: { borderColor: "border-l-primary", iconColor: "text-primary" },
    complete: { borderColor: "border-l-emerald-500", iconColor: "text-emerald-500" },
    error: { borderColor: "border-l-destructive", iconColor: "text-destructive" },
  }

  const { borderColor, iconColor } = statusConfig[complianceStatus]

  type ModelStatus = "uninitialized" | "loading" | "initialized" | "error"

  const [modelStatus, setModelStatus] = useState<ModelStatus>("uninitialized")

  const modelConfig: Record<
    ModelStatus,
    { borderColor: string; iconColor: string; textColor: string; text: string }
  > = {
    uninitialized: {
      borderColor: "border-r-amber-500",
      iconColor: "text-amber-500",
      textColor: "text-amber-500",
      text: "Not initialized",
    },
    loading: {
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

  const {
    borderColor: modelBorderColor,
    iconColor: modelIconColor,
    textColor: modelTextColor,
    text: modelStatusText,
  } = modelConfig[modelStatus]

  // const stats = [
  //   { label: "Databases", value: dbs?.count, sub: "connected" },
  //   { label: "Frameworks", value: frameworks?.count, sub: "available" },
  //   {
  //     label: "Last check",
  //     value: latestCheck ? timeAgo(new Date(latestCheck.date)) : "—",
  //     sub: "ago",
  //   },
  //   { label: "Pass rate", value: "—", sub: "last check" },
  // ]
  return (
    <div className="flex flex-col gap-3 p-6">
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
        <Card className={cn("bg-muted/50 border-l-2", borderColor)}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">Compliance status</CardTitle>
            <ShieldCheck className={cn("size-5", iconColor)} />
          </CardHeader>
          <CardContent className="pt-0">
            <AssertionsStatus
              className="-mt-4 -ml-3"
              textClassName="text-xs"
              onStatusChange={setComplianceStatus}
            />
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full text-xs"
              onClick={() => setRunCheckOpen(true)}
            >
              <Play size={12} className="mr-1" /> Run check
            </Button>
          </CardContent>
        </Card>
        <Card
          className="hover:bg-muted group bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate("/databases")}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Databases connected</CardTitle>
            <Database className="text-muted-foreground/40 size-5 transition-colors group-hover:text-blue-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-medium">{dbs?.count ?? "—"}</p>
            <p className="text-muted-foreground mt-1 text-xs">registered databases</p>
          </CardContent>
        </Card>
        <Card
          className="hover:bg-muted group bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate("/databases")}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Idk Some bullshit</CardTitle>
            <Database className="text-muted-foreground/40 size-5 transition-colors group-hover:text-red-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-medium">{dbs?.count ?? "—"}</p>
            <p className="text-muted-foreground mt-1 text-xs">registered databases</p>
          </CardContent>
        </Card>
        <Card className={cn("bg-muted/50 border-r-2 transition-colors", modelBorderColor)}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">AI model</CardTitle>
            <BrainCircuit className={cn("size-5", modelIconColor)} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className={cn("-mt-1 mb-3 text-xs", modelTextColor)}>{modelStatusText}</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() =>
                setModelStatus((s) => (s === "initialized" ? "uninitialized" : "initialized"))
              }
              disabled={modelStatus === "loading"}
            >
              <Cpu size={12} className="mr-1" />
              {modelStatus === "initialized" ? "Reinitialize" : "Initialize model"}
            </Button>
          </CardContent>
        </Card>
        <RunCheckDialog open={runCheckOpen} onOpenChange={setRunCheckOpen} />
      </div>
      {/* Latest Checks Table */}
      <Card className="bg-muted/50">
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
            onClick={() => navigate("/compliance/assertions")}
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                    onClick={() => setSortAsc((p) => !p)}
                  >
                    ID <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((check) => (
                <TableRow
                  key={check.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setClientDb(check.id)
                    navigate(`/compliance/assertions`)
                  }}
                >
                  <TableCell className="text-muted-foreground">#{check.id}</TableCell>
                  <TableCell className="font-medium">{check.framework}</TableCell>
                  <TableCell className="text-muted-foreground">{check.database}</TableCell>
                  <TableCell className="text-muted-foreground">{check.date}</TableCell>
                  <TableCell className="text-right">
                    <ResultBadge passed={check.passed} total={check.total} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
