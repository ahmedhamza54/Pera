"use client";

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { LifeBalanceWheel } from "@/components/life-balance-wheel"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

interface PillarData {
  name: string
  score: number
  trend: "up" | "down"
  color: string
}

interface WeeklyStat {
  label: string
  value: string
  change: string
}

interface DashboardData {
  pillarStats: PillarData[]
  weeklyStats: WeeklyStat[]
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data")
  }
  return response.json()
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Dashboard" />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen pb-20">
        <MobileHeader title="Dashboard" />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const overallScore = Math.round(
    dashboardData.pillarStats.reduce((acc: number, p: PillarData) => acc + p.score, 0) / 
    dashboardData.pillarStats.length
  );

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
          <LifeBalanceWheel data={dashboardData.pillarStats} />
        </Card>

        {/* Pillar Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Pillar Breakdown</h3>

          {dashboardData.pillarStats.map((pillar: PillarData) => (
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
            {dashboardData.weeklyStats.map((stat: WeeklyStat) => (
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
