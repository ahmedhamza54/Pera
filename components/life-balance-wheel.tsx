"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface PillarData {
  name: string
  score: number
  color: string
}

interface LifeBalanceWheelProps {
  data: PillarData[]
}

export function LifeBalanceWheel({ data }: LifeBalanceWheelProps) {
  const chartData = data.map((pillar) => ({
    pillar: pillar.name,
    score: pillar.score,
  }))

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--accent))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            stroke="hsl(var(--border))"
          />
          <Radar
            name="Life Balance"
            dataKey="score"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
