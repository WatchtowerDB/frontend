import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"

export interface ScoreBand {
  max: number
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  borderColor: string
  color: string
}

interface ScoreCardProps {
  label: string
  score: number
  scoreBands: ScoreBand[]
  emphasize?: boolean
}

export function ScoreCard({ label, score, scoreBands, emphasize = false }: ScoreCardProps) {
  // Compliance score is on a 0–5 scale. Bands map a continuous score to a
  // discrete risk tier, mirroring how the underlying audit checks are graded.
  const band = scoreBands.find((b) => score <= b.max) ?? scoreBands[scoreBands.length - 1]

  const gaugeData = [{ value: (score / 10) * 100, fill: band.color }]
  return (
    <Card
      className={
        emphasize
          ? `w-[160px] border-2 ${band.borderColor}`
          : `w-[160px] border-r-1 border-l-1 border-t-transparent border-b-transparent ${band.borderColor}`
      }
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
                // Optional: If you want the chart ring to match the border color too:
                // fill={band.borderColor.includes("emerald") ? "#10b981" : band.borderColor.includes("amber") ? "#f59e0b" : "hsl(var(--destructive))"}
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
