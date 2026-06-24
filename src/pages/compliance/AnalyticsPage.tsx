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
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useDatabaseScore, useSchemaIterations } from "@/hooks/useAnalytics"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAllFrameworks } from "@/hooks/useFrameworks"
import { InfoIcon } from "lucide-react"
import { ScoreCard } from "./components/ScoreCard"

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
    variant: "warning" as const,
    color: "#d97706",
    borderColor: "border-amber-500",
  },
  {
    max: 10.0,
    label: "Compliant",
    variant: "success" as const,
    color: "#16a34a",
    borderColor: "border-emerald-500",
  },
]

const RADAR_MIN_FRAMEWORKS = 3
const LINE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#9333ea"]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Static config for the framework comparison chart
const frameworkChartConfig = {
  score: {
    label: "Compliance score",
    color: "#16a34a",
  },
} satisfies ChartConfig

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
      score: data.compliance_score,
      schemaCount: data.schema_count,
      assertionsPassed: data.assertions_passed,
      assertionsTotal: data.assertions_total,
    }))
  }, [dbScore, frameworkNameById])

  const showRadar = frameworkEntries.length >= RADAR_MIN_FRAMEWORKS

  // Slugifying dynamic framework names to prevent key collision within chart rendering
  const iterationChartData = useMemo(() => {
    if (!iterations) return []
    return iterations.map((item) => {
      const row: Record<string, number | string> = {
        version: item.version,
        overall: item.compliance_score,
      }
      Object.entries(item.framework_scores).forEach(([frameworkId, fwData]) => {
        const name = frameworkNameById.get(frameworkId) ?? frameworkId
        row[slugify(name)] = fwData.score
      })
      return row
    })
  }, [iterations, frameworkNameById])

  // Dynamically compiling the historical line chart config to feed Shadcn primitives cleanly
  const historyChartConfig = useMemo(() => {
    const config: ChartConfig = {
      overall: {
        label: "Schema overall",
        color: "#64748b",
      },
    }
    frameworkEntries.forEach((fw, i) => {
      config[slugify(fw.name)] = {
        label: fw.name,
        color: LINE_COLORS[i % LINE_COLORS.length],
      }
    })
    return config
  }, [frameworkEntries])

  const activeDbId = selectedDbId ?? dbs?.results?.[0]?.id ?? null

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="flex min-w-0 flex-col gap-6 p-6">
        {/* Database selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="db-select" className="text-muted-foreground text-sm font-medium">
            Database
          </label>
          <Select
            /* Ensure a solid fallback string during the loading phase */
            value={selectedDbId ? String(selectedDbId) : undefined}
            onValueChange={(value) => {
              setSelectedDbId(Number(value))
              setSelectedSchemaName(null)
              setSelectedFrameworkId(null)
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
          <div className="flex flex-1 flex-col items-center justify-center pt-[30vh]">
            {/* Hacky ass pt-3vh */}
            <InfoIcon className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-muted-foreground text-sm">
              Select a database to view its compliance score.
            </p>
          </div>
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
            {/*        emphasize
          ? `border-2 ${band.borderColor}`
          : `border-r-1 border-l-1 border-t-transparent border-b-transparent ${band.borderColor}`, */}
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <ScrollArea className="w-full pb-2 whitespace-nowrap">
                  <div className="flex w-max gap-3">
                    <ScoreCard
                      className={`border-2`}
                      label="Overall"
                      score={dbScore.compliance_score}
                      scoreBands={SCORE_BANDS}
                      emphasize
                    />

                    <div className="bg-border h-55 w-px shrink-0" />

                    <div className="flex gap-3">
                      {frameworkEntries.map((fw) => (
                        <ScoreCard
                          key={fw.frameworkId}
                          label={fw.name}
                          score={fw.score}
                          scoreBands={SCORE_BANDS}
                        />
                      ))}
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Score-band legend */}
              <div className="bg-background flex h-[200px] w-52 shrink-0 border-l pl-4">
                <div className="flex h-full w-full flex-col py-2 text-xs">
                  <div className="font-medium">Score Bands</div>
                  <div className="mt-2 flex flex-1 flex-col justify-evenly">
                    {SCORE_BANDS.map((band, i) => {
                      const min = i === 0 ? 0 : SCORE_BANDS[i - 1].max + 0.1
                      return (
                        <div
                          key={band.label}
                          className="bg-muted/30 flex h-10 items-center gap-2 rounded-md px-2"
                        >
                          <Badge
                            variant={band.variant}
                            className="px-1.5 py-0 font-mono text-[10px]"
                          >
                            {min.toFixed(1)}–{band.max.toFixed(1)}
                          </Badge>
                          <span className="font-medium">{band.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Schema iteration history & analytics section */}
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Framework comparison */}
              <Card className="lg:basis-[30%]">
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Framework score comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {frameworkEntries.length < 2 ? (
                    <div className="flex h-[300px] w-full flex-col items-center justify-center text-center">
                      <p className="text-muted-foreground text-sm font-medium">
                        Not enough frameworks tested
                      </p>
                      <p className="text-muted-foreground/70 mt-1 text-xs">
                        Requires at least 2 frameworks to display a visual comparison.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer config={frameworkChartConfig} className="h-[300px] w-full">
                      {showRadar ? (
                        <RadarChart data={frameworkEntries}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Compliance score"
                            dataKey="score"
                            stroke="var(--color-score)"
                            fill="var(--color-score)"
                            fillOpacity={0.25}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent className="min-w-[150px] gap-4" hideLabel />
                            }
                          />
                        </RadarChart>
                      ) : (
                        <BarChart
                          data={frameworkEntries}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            domain={[0, 10]}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent className="min-w-[150px] gap-4" />}
                          />
                          <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Schema iteration history */}
              <Card className="lg:flex-1">
                <CardHeader className="flex flex-row flex-wrap items-baseline justify-between gap-2 space-y-0">
                  <CardTitle className="text-sm font-semibold">Schema score history</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select
                      /* Keep it undefined when null so the dynamic placeholder still operates perfectly */
                      value={selectedFrameworkId ? String(selectedFrameworkId) : undefined}
                      disabled={!selectedSchemaName}
                      onValueChange={(value) => {
                        // If they choose the string "all", clear the state back to null
                        setSelectedFrameworkId(value === "all" ? null : Number(value))
                      }}
                    >
                      <SelectTrigger className="h-8 w-[160px] text-xs">
                        <SelectValue
                          placeholder={
                            selectedSchemaName ? "All Frameworks" : "Select a framework…"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent position="popper" side="bottom">
                        {selectedSchemaName && (
                          /* Use a valid string token instead of an empty primitive. No more gray text! */
                          <SelectItem value="all" className="text-foreground text-xs font-medium">
                            All Frameworks
                          </SelectItem>
                        )}
                        {frameworkEntries.map((fw) => (
                          <SelectItem
                            key={fw.frameworkId}
                            value={fw.frameworkId}
                            className="text-xs"
                          >
                            {fw.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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

                  {/* Only allow rendering if the data matches our standards—at least 3 iterations! */}
                  {selectedSchemaName && !isIterationsLoading && iterationChartData.length < 3 && (
                    <div className="flex h-[300px] w-full flex-col items-center justify-center text-center">
                      <p className="text-muted-foreground text-sm font-medium">
                        Not enough data available
                      </p>
                      <p className="text-muted-foreground/70 mt-1 text-xs">
                        Requires at least 3 historical iterations to plot a history chart.
                      </p>
                    </div>
                  )}

                  {selectedSchemaName && !isIterationsLoading && iterationChartData.length >= 3 && (
                    <ChartContainer config={historyChartConfig} className="h-[300px] w-full">
                      <LineChart
                        data={iterationChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="version"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent className="min-w-[150px] gap-4" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          stroke="var(--color-overall)"
                          strokeDasharray="5 4"
                          dot={false}
                        />
                        {frameworkEntries.map((fw) => {
                          const key = slugify(fw.name)
                          return (
                            <Line
                              key={fw.frameworkId}
                              type="monotone"
                              dataKey={key}
                              stroke={`var(--color-${key})`}
                              connectNulls
                              dot={true}
                            />
                          )
                        })}
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
