"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarGridProps {
  selectedDay: number
  onSelectDay: (day: number) => void
  currentMonth: number
  currentYear: number
  plan: any
}

export function CalendarGrid({ 
  selectedDay, 
  onSelectDay, 
  currentMonth, 
  currentYear,
  plan 
}: CalendarGridProps) {
  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Get the day of week the month starts on (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  // Get today's date for comparison
  const today = new Date()
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear()
  const todayDate = today.getDate()

  // Helper to check if a day has tasks
  const hasTasksOnDay = (day: number) => {
    if (!plan) return false
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return plan.tasks.some((task: any) => task.startDate === dateString)
  }

  // Generate array of days
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => ({
    date: i + 1,
    hasEvents: hasTasksOnDay(i + 1),
    isToday: isCurrentMonth && (i + 1) === todayDate
  }))

  return (
    <Card className="p-4">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {calendarDays.map((day) => (
          <button
            key={day.date}
            onClick={() => onSelectDay(day.date)}
            className={cn(
              "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative",
              selectedDay === day.date
                ? "bg-primary text-primary-foreground font-semibold"
                : day.isToday
                ? "bg-accent text-accent-foreground font-semibold ring-2 ring-primary"
                : "hover:bg-secondary text-foreground",
            )}
          >
            <span>{day.date}</span>
            {day.hasEvents && (
              <div className={cn(
                "absolute bottom-1 w-1 h-1 rounded-full",
                selectedDay === day.date ? "bg-primary-foreground" : "bg-primary"
              )} />
            )}
          </button>
        ))}
      </div>
    </Card>
  )
}