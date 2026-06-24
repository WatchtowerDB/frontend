import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils" // Ensure you have your standard clsx/tailwind-merge utility
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"

export interface ScoreBand {
  max: number
  label: string
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  borderColor: string
  color: string
}

export const DEFAULT_SCORE_BANDS: ScoreBand[] = [
  {
    max: 3.8,
    label: "Failing",
    variant: "destructive",
    borderColor: "border-red-500",
    color: "#dc2626",
  },
  {
    max: 6.8,
    label: "At risk",
    variant: "secondary",
    borderColor: "border-amber-500",
    color: "#d97706",
  },
  {
    max: 10.0,
    label: "Compliant",
    variant: "default",
    borderColor: "border-emerald-500",
    color: "#16a34a",
  },
]

interface ScoreCardProps {
  label: string
  score: number
  scoreBands?: ScoreBand[]
  emphasize?: boolean
  className?: string // Added to the interface!
}

export function ScoreCard({
  label,
  score,
  scoreBands,
  emphasize = false,
  className,
}: ScoreCardProps) {
  const bands = scoreBands ?? DEFAULT_SCORE_BANDS
  const band = bands.find((b) => score <= b.max) ?? bands[bands.length - 1]

  const gaugeData = [{ value: (score / 10) * 100, fill: band.color }]

  return (
    <Card
      className={cn(
        "w-[160px]",
        emphasize
          ? `border-2 ${band.borderColor}`
          : `border-r-1 border-l-1 border-t-transparent border-b-transparent ${band.borderColor}`,
        className, // Injected at the end so your custom styles take precedence!
      )}
    >
      <CardContent className="flex flex-col items-center gap-1.5 p-3">
        <p className="text-muted-foreground self-start text-xs">{label}</p>
        <div className="relative h-[110px] w-[110px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
              innerRadius="75%"
              outerRadius="100%"
              barSize={10}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                cornerRadius={6}
                isAnimationActive={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-medium">{score.toFixed(1)}</span>
            <span className="text-muted-foreground text-[10px]">/ 10</span>
          </div>
        </div>
        <Badge variant={band.variant}>{band.label}</Badge>
      </CardContent>
    </Card>
  )
}
