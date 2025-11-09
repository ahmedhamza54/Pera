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
  // Ensure we have valid data
  const validData = data.filter(pillar => pillar.score >= 0);
  
  const chartData = validData.map((pillar) => ({
    pillar: pillar.name,
    score: pillar.score,
  }));

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ 
              fill: "hsl(var(--foreground))", 
              fontSize: 12,
              dy: 4
            }}
            stroke="hsl(var(--border))"
          />
          <Radar
            name="Life Balance"
            dataKey="score"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
