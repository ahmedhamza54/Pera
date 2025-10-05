"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const calendarDays = [
  { date: 1, hasEvents: false, isToday: false },
  { date: 2, hasEvents: false, isToday: false },
  { date: 3, hasEvents: false, isToday: false },
  { date: 4, hasEvents: false, isToday: false },
  { date: 5, hasEvents: true, isToday: true },
  { date: 6, hasEvents: true, isToday: false },
  { date: 7, hasEvents: true, isToday: false },
  { date: 8, hasEvents: false, isToday: false },
  { date: 9, hasEvents: false, isToday: false },
  { date: 10, hasEvents: true, isToday: false },
  { date: 11, hasEvents: false, isToday: false },
  { date: 12, hasEvents: false, isToday: false },
  { date: 13, hasEvents: false, isToday: false },
  { date: 14, hasEvents: false, isToday: false },
  { date: 15, hasEvents: false, isToday: false },
  { date: 16, hasEvents: false, isToday: false },
  { date: 17, hasEvents: false, isToday: false },
  { date: 18, hasEvents: false, isToday: false },
  { date: 19, hasEvents: false, isToday: false },
  { date: 20, hasEvents: false, isToday: false },
  { date: 21, hasEvents: false, isToday: false },
  { date: 22, hasEvents: false, isToday: false },
  { date: 23, hasEvents: false, isToday: false },
  { date: 24, hasEvents: false, isToday: false },
  { date: 25, hasEvents: false, isToday: false },
  { date: 26, hasEvents: false, isToday: false },
  { date: 27, hasEvents: false, isToday: false },
  { date: 28, hasEvents: false, isToday: false },
  { date: 29, hasEvents: false, isToday: false },
  { date: 30, hasEvents: false, isToday: false },
  { date: 31, hasEvents: false, isToday: false },
]

interface CalendarGridProps {
  selectedDay: number
  onSelectDay: (day: number) => void
}

export function CalendarGrid({ selectedDay, onSelectDay }: CalendarGridProps) {
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
        {/* Empty cells for days before month starts (assuming month starts on Friday) */}
        {[...Array(5)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {calendarDays.map((day) => (
          <button
            key={day.date}
            onClick={() => onSelectDay(day.date)}
            className={cn(
              "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative",
              selectedDay === day.date
                ? "bg-accent text-accent-foreground font-semibold"
                : "hover:bg-secondary text-foreground",
            )}
          >
            <span>{day.date}</span>
            {day.hasEvents && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-chart-1" />}
          </button>
        ))}
      </div>
    </Card>
  )
}
