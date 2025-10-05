import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { LifeBalanceWheel } from "@/components/life-balance-wheel"
import { TrendingUp, TrendingDown } from "lucide-react"

const pillarsData = [
  { name: "Health", score: 75, trend: "up", color: "hsl(var(--chart-1))" },
  { name: "Social", score: 60, trend: "down", color: "hsl(var(--chart-2))" },
  { name: "Mind", score: 85, trend: "up", color: "hsl(var(--chart-3))" },
  { name: "Career", score: 70, trend: "up", color: "hsl(var(--chart-4))" },
  { name: "Din", score: 65, trend: "up", color: "hsl(var(--chart-5))" },
]

const weeklyStats = [
  { label: "Tasks Completed", value: "42", change: "+12%" },
  { label: "Avg. Balance", value: "71%", change: "+5%" },
  { label: "Active Days", value: "6/7", change: "0%" },
]

export default function DashboardPage() {
  const overallScore = Math.round(pillarsData.reduce((acc, p) => acc + p.score, 0) / pillarsData.length)

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Dashboard" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Overall Score */}
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Overall Life Balance</p>
          <p className="text-5xl font-bold mb-1">{overallScore}%</p>
          <p className="text-sm text-muted-foreground">Keep up the great work</p>
        </Card>

        {/* Life Balance Wheel */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Life Balance Wheel</h2>
          <LifeBalanceWheel data={pillarsData} />
        </Card>

        {/* Pillar Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Pillar Breakdown</h3>

          {pillarsData.map((pillar) => (
            <Card key={pillar.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pillar.color }} />
                  <span className="font-medium">{pillar.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{pillar.score}%</span>
                  {pillar.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-chart-3" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${pillar.score}%`, backgroundColor: pillar.color }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Weekly Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>

          <div className="grid grid-cols-3 gap-3">
            {weeklyStats.map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 text-balance">{stat.label}</p>
                <p className="text-xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-chart-3">{stat.change}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
