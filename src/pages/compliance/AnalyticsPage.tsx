import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useDatabaseScore, useSchemaIterations } from "@/hooks/useAnalytics"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useAllFrameworks } from "@/hooks/useFrameworks"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ScoreCard } from "./components/ScoreCard"

// Compliance score is on a 0–10 scale. Bands map a continuous score to a
// discrete risk tier, mirroring how the underlying audit checks are graded.
const SCORE_BANDS = [
  {
    max: 3.8,
    label: "Failing",
    variant: "destructive" as const,
    color: "#dc2626",
    borderColor: "border-destructive",
  },
  {
    max: 6.8,
    label: "At risk",
    variant: "secondary" as const,
    color: "#d97706",
    borderColor: "border-amber-500",
  },
  {
    max: 10.0,
    label: "Compliant",
    variant: "default" as const,
    color: "#16a34a",
    borderColor: "border-emerald-500",
  },
]

// Below this many frameworks, a radar chart doesn't have enough vertices to
// read as a shape, so we fall back to a bar chart instead.
const RADAR_MIN_FRAMEWORKS = 3

const LINE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#9333ea"]

export default function AnalyticsPage() {
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null)
  const [selectedSchemaName, setSelectedSchemaName] = useState<string | null>(null)
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number | null>(null)

  const { data: dbs } = useAllClientDBs()
  const { data: frameworks } = useAllFrameworks()

  const { data: dbSchemas } = useAllClientDBSchemas({
    client_db: selectedDbId ? [selectedDbId] : undefined,
    latest: true,
  })

  const { data: dbScore, isLoading: isScoreLoading } = useDatabaseScore({
    db_id: selectedDbId as number,
    framework_id: undefined,
  })

  const { data: iterations, isLoading: isIterationsLoading } = useSchemaIterations({
    db_id: selectedDbId as number,
    schema_name: selectedSchemaName as string,
    framework_id: selectedFrameworkId ? [selectedFrameworkId] : undefined,
  })

  // framework_scores is keyed by framework id (as a string), so we resolve
  // display names against useAllFrameworks rather than assuming the key
  // itself is human-readable.
  const frameworkNameById = useMemo(() => {
    const map = new Map<string, string>()
    frameworks?.results?.forEach((fw: { id: number; name: string }) => {
      map.set(String(fw.id), fw.name)
    })
    return map
  }, [frameworks])

  const frameworkEntries = useMemo(() => {
    if (!dbScore?.framework_scores) return []
    return Object.entries(dbScore.framework_scores).map(([frameworkId, data]) => ({
      frameworkId,
      name: frameworkNameById.get(frameworkId) ?? `Framework ${frameworkId}`,
      // NOTE: FrameworkScoreData has both `framework_compliance` and a
      // nested `compliance_score`. We surface `framework_compliance` as the
      // headline number for a framework card to avoid colliding visually
      // with the top-level, whole-database `compliance_score` shown above it.
      score: data.framework_compliance,
      schemaCount: data.schema_count,
      assertionsPassed: data.assertions_passed,
      assertionsTotal: data.assertions_total,
    }))
  }, [dbScore, frameworkNameById])

  const showRadar = frameworkEntries.length >= RADAR_MIN_FRAMEWORKS

  const iterationChartData = useMemo(() => {
    if (!iterations) return []
    return iterations.map((item) => {
      const row: Record<string, number | string> = {
        version: item.version,
        overall: item.compliance_score,
      }
      Object.entries(item.framework_scores).forEach(([frameworkId, fwData]) => {
        row[frameworkNameById.get(frameworkId) ?? frameworkId] = fwData.score
      })
      return row
    })
  }, [iterations, frameworkNameById])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="flex min-w-0 flex-col gap-6 p-6">
        {/* Database selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="db-select" className="text-muted-foreground text-sm font-medium">
            Database
          </label>
          <Select
            value={selectedDbId ? String(selectedDbId) : undefined}
            onValueChange={(value) => {
              setSelectedDbId(Number(value))
              setSelectedSchemaName(null)
            }}
          >
            <SelectTrigger id="db-select" className="w-[260px]">
              <SelectValue placeholder="Select a database…" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom">
              {dbs?.results?.map((db: { id: number; name: string }) => (
                <SelectItem key={db.id} value={String(db.id)}>
                  {db.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedDbId && (
          <p className="text-muted-foreground text-sm">
            Select a database to view its compliance score.
          </p>
        )}

        {selectedDbId && isScoreLoading && (
          <ScrollArea className="w-full pb-2 whitespace-nowrap">
            <div className="flex w-max gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-[150px] rounded-lg" />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {selectedDbId && dbScore && (
          <>
            {/* Overall + per-framework score cards */}
            <ScrollArea className="w-full pb-2 whitespace-nowrap">
              <div className="flex w-max gap-3">
                <ScoreCard
                  label="Overall"
                  score={dbScore.compliance_score}
                  scoreBands={SCORE_BANDS}
                  emphasize
                />
                {frameworkEntries.map((fw) => (
                  <ScoreCard
                    key={fw.frameworkId}
                    label={fw.name}
                    score={fw.score}
                    scoreBands={SCORE_BANDS}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Score legend */}
            <div className="text-muted-foreground flex flex-wrap gap-4 border-t pt-3 text-xs">
              {SCORE_BANDS.map((band, i) => {
                const min = i === 0 ? 0 : SCORE_BANDS[i - 1].max + 0.1
                return (
                  <span key={band.label} className="flex items-center gap-1.5">
                    <Badge variant={band.variant} className="px-1.5 py-0 font-mono text-[10px]">
                      {min.toFixed(1)}–{band.max.toFixed(1)}
                    </Badge>
                    {band.label}
                  </span>
                )
              })}
            </div>

            {/* Schema iteration history, filterable by framework */}
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-baseline justify-between gap-2 space-y-0">
                <CardTitle className="text-sm font-semibold">Schema score history</CardTitle>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedSchemaName ?? undefined}
                    onValueChange={(value) => setSelectedSchemaName(value)}
                  >
                    <SelectTrigger className="h-8 w-[180px] text-xs">
                      <SelectValue placeholder="Select a schema…" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      {dbSchemas?.results?.map((schema) => (
                        <SelectItem key={schema.id} value={schema.name}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedFrameworkId ? String(selectedFrameworkId) : "all"}
                    onValueChange={(value) =>
                      setSelectedFrameworkId(value === "all" ? null : Number(value))
                    }
                  >
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue placeholder="All frameworks" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom">
                      <SelectItem value="all">All frameworks</SelectItem>
                      {frameworkEntries.map((fw) => (
                        <SelectItem key={fw.frameworkId} value={fw.frameworkId}>
                          {fw.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedSchemaName && (
                  <p className="text-muted-foreground text-sm">
                    Select a schema to see how its score changed across versions.
                  </p>
                )}

                {selectedSchemaName && isIterationsLoading && (
                  <Skeleton className="h-[260px] w-full" />
                )}

                {selectedSchemaName && iterationChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={iterationChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="version" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        name="Schema overall"
                        stroke="#64748b"
                        strokeDasharray="5 4"
                        dot={false}
                      />
                      {frameworkEntries.map((fw, i) => (
                        <Line
                          key={fw.frameworkId}
                          type="monotone"
                          dataKey={fw.name}
                          stroke={LINE_COLORS[i % LINE_COLORS.length]}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Framework comparison: radar for 3+, bar for fewer */}
            <Card>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Framework comparison</CardTitle>
                <p className="text-muted-foreground text-xs">
                  {frameworkEntries.length} framework{frameworkEntries.length === 1 ? "" : "s"}{" "}
                  tracked
                  {showRadar
                    ? " — shown as a radar chart."
                    : " — fewer than 3, shown as a bar chart instead of a radar."}
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {showRadar ? (
                    <RadarChart data={frameworkEntries}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Compliance score"
                        dataKey="score"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.25}
                      />
                      <Tooltip />
                    </RadarChart>
                  ) : (
                    <BarChart data={frameworkEntries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
