"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarGrid } from "@/components/calendar-grid"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { usePlan } from "@/contexts/plan-context"

const pillars = [
  { name: "Health", color: "bg-chart-1" },
  { name: "Social", color: "bg-chart-2" },
  { name: "Mind", color: "bg-chart-3" },
  { name: "Career", color: "bg-chart-4" },
  { name: "Din", color: "bg-chart-5" },
]

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function CalendarPage() {
  const { plan, toggleTaskCompletion, getTasksForDate } = usePlan()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate())
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  // Update selected day when component mounts to today's date
  useEffect(() => {
    const today = new Date()
    setSelectedDay(today.getDate())
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }, [])

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Format date for comparison with task dates
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedDateString = formatDate(currentYear, currentMonth, selectedDay)
  const todayEvents = getTasksForDate(selectedDateString)

  const isToday = 
    selectedDay === currentDate.getDate() && 
    currentMonth === currentDate.getMonth() && 
    currentYear === currentDate.getFullYear()

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Calendar" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {months[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarGrid 
          selectedDay={selectedDay} 
          onSelectDay={setSelectedDay}
          currentMonth={currentMonth}
          currentYear={currentYear}
          plan={plan}
        />

        {/* Today's Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isToday ? "Today's" : `${months[currentMonth]} ${selectedDay}'s`} Schedule
            </h3>
            <Badge variant="secondary">{todayEvents.length} tasks</Badge>
          </div>

          {!plan ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">No plan approved yet</p>
              <p className="text-xs text-muted-foreground">
                Visit the Diagnostic page to approve your personalized plan
              </p>
            </Card>
          ) : todayEvents.length > 0 ? (
            todayEvents.map((task) => {
              const pillar = pillars.find((p) => p.name === task.pillar)

              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1"
                    />
                    <div className={`w-1 h-full rounded-full ${pillar?.color} min-h-[60px]`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{task.duration}</span>
                      </div>
                      <p className={`font-medium mb-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {task.pillar}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No tasks scheduled for this day</p>
            </Card>
          )}
        </div>

        {/* Pillar Legend */}
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Pillar Colors</p>
          <div className="flex flex-wrap gap-3">
            {pillars.map((pillar) => (
              <div key={pillar.name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${pillar.color}`} />
                <span className="text-xs">{pillar.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}