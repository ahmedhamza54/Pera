"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlan } from "@/contexts/plan-context"
import { CheckCircle2, Circle, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock AI agent output - this will be replaced by actual AI output
const mockDiagnostic = {
  objectif: "Improve physical health by running 3 times a week",
  problem: "Lack of motivation and inconsistent sleep schedule",
  motivation: "Better energy levels and self-discipline",
  tasks: [
    { id: 1, title: "Morning run", pillar: "Health" as const, duration: "30 min", startDate: "2025-10-18", completed: false },
    { id: 2, title: "Team standup", pillar: "Career" as const, duration: "15 min", startDate: "2025-10-18", completed: false },
    { id: 3, title: "Evening yoga", pillar: "Health" as const, duration: "45 min", startDate: "2025-10-19", completed: false },
    { id: 4, title: "Read book chapter", pillar: "Mind" as const, duration: "30 min", startDate: "2025-10-19", completed: false },
    { id: 5, title: "Coffee with friend", pillar: "Social" as const, duration: "1 hr", startDate: "2025-10-20", completed: false },
    { id: 6, title: "Evening prayer", pillar: "Din" as const, duration: "20 min", startDate: "2025-10-20", completed: false },
    { id: 7, title: "Gym workout", pillar: "Health" as const, duration: "1 hr", startDate: "2025-10-21", completed: false },
    { id: 8, title: "Project review", pillar: "Career" as const, duration: "45 min", startDate: "2025-10-21", completed: false },
    { id: 9, title: "Meditation session", pillar: "Mind" as const, duration: "20 min", startDate: "2025-10-22", completed: false },
    { id: 10, title: "Family dinner", pillar: "Social" as const, duration: "2 hrs", startDate: "2025-10-22", completed: false },
  ]
}

const pillars = [
  { name: "Health", color: "bg-chart-1" },
  { name: "Social", color: "bg-chart-2" },
  { name: "Mind", color: "bg-chart-3" },
  { name: "Career", color: "bg-chart-4" },
  { name: "Din", color: "bg-chart-5" },
]

export default function DiagnosticPage() {
  const [diagnostic] = useState(mockDiagnostic)
  const { plan, approvePlan, getCompletionStats } = usePlan()
  const router = useRouter()
  const stats = getCompletionStats()

  const handleApprove = () => {
    approvePlan(diagnostic)
    router.push("/calendar")
  }

  const isApproved = plan !== null

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Diagnostic Table" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Diagnostic Overview</h1>

        {/* Core Diagnostic Information */}
        <div className="space-y-4">
          <Card className="p-4 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="font-semibold text-primary mb-1">Objectif</h2>
            <p className="text-muted-foreground text-sm">{diagnostic.objectif}</p>
          </Card>

          <Card className="p-4 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="font-semibold text-primary mb-1">Problem</h2>
            <p className="text-muted-foreground text-sm">{diagnostic.problem}</p>
          </Card>

          <Card className="p-4 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="font-semibold text-primary mb-1">Motivation</h2>
            <p className="text-muted-foreground text-sm">{diagnostic.motivation}</p>
          </Card>
        </div>

        {/* Tasks Overview */}
        <Card className="p-4">
          <h2 className="font-semibold text-primary mb-3">Proposed Tasks</h2>
          <div className="space-y-2">
            {diagnostic.tasks.map((task) => {
              const pillar = pillars.find(p => p.name === task.pillar)
              return (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className={`w-1 h-12 rounded-full ${pillar?.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{task.pillar}</Badge>
                      <span className="text-xs text-muted-foreground">{task.duration}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {!isApproved ? (
          <Button
            onClick={handleApprove}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            Approve & Add to Calendar
          </Button>
        ) : (
          <>
            {/* Progress Statistics */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Progress</h2>
              </div>

              {/* Overall Progress */}
              <Card className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">{stats.percentage}%</div>
                  <p className="text-sm text-muted-foreground">
                    {stats.completed} of {stats.total} tasks completed
                  </p>
                  <div className="w-full bg-secondary rounded-full h-3 mt-4">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Progress by Pillar */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Progress by Pillar</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byPillar).map(([pillarName, pillarStats]) => {
                    const pillar = pillars.find(p => p.name === pillarName)
                    const percentage = pillarStats.total > 0 
                      ? Math.round((pillarStats.completed / pillarStats.total) * 100) 
                      : 0

                    return (
                      <div key={pillarName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${pillar?.color}`} />
                            <span className="text-sm font-medium">{pillarName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {pillarStats.completed}/{pillarStats.total}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${pillar?.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Task Completion List */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Task Status</h3>
                <div className="space-y-2">
                  {diagnostic.tasks.map((task) => {
                    const isCompleted = plan?.tasks.find(t => t.id === task.id)?.completed || false
                    return (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}