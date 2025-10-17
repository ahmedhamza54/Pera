"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface Task {
  id: number
  title: string
  pillar: 'Health' | 'Social' | 'Mind' | 'Career' | 'Din'
  duration: string
  startDate: string
  completed: boolean
}

interface DiagnosticData {
  objectif: string
  problem: string
  motivation: string
  tasks: Task[]
}

interface PlanContextType {
  plan: DiagnosticData | null
  approvePlan: (plan: DiagnosticData) => void
  toggleTaskCompletion: (taskId: number) => void
  getTasksForDate: (date: string) => Task[]
  getCompletionStats: () => {
    total: number
    completed: number
    percentage: number
    byPillar: Record<string, { total: number; completed: number }>
  }
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<DiagnosticData | null>(null)

  const approvePlan = (newPlan: DiagnosticData) => {
    setPlan(newPlan)
  }

  const toggleTaskCompletion = (taskId: number) => {
    if (!plan) return
    
    setPlan({
      ...plan,
      tasks: plan.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    })
  }

  const getTasksForDate = (date: string) => {
    if (!plan) return []
    return plan.tasks.filter(task => task.startDate === date)
  }

  const getCompletionStats = () => {
    if (!plan) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        byPillar: {}
      }
    }

    const total = plan.tasks.length
    const completed = plan.tasks.filter(t => t.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    const byPillar: Record<string, { total: number; completed: number }> = {}
    
    plan.tasks.forEach(task => {
      if (!byPillar[task.pillar]) {
        byPillar[task.pillar] = { total: 0, completed: 0 }
      }
      byPillar[task.pillar].total++
      if (task.completed) {
        byPillar[task.pillar].completed++
      }
    })

    return { total, completed, percentage, byPillar }
  }

  return (
    <PlanContext.Provider value={{
      plan,
      approvePlan,
      toggleTaskCompletion,
      getTasksForDate,
      getCompletionStats
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}