"use client"

import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarGrid } from "@/components/calendar-grid"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const pillars = [
  { name: "Health", color: "bg-chart-1" },
  { name: "Social", color: "bg-chart-2" },
  { name: "Mind", color: "bg-chart-3" },
  { name: "Career", color: "bg-chart-4" },
  { name: "Din", color: "bg-chart-5" },
]

const eventsByDay: Record<
  number,
  Array<{ id: number; title: string; pillar: string; time: string; duration: string }>
> = {
  5: [
    { id: 1, title: "Morning workout", pillar: "Health", time: "7:00 AM", duration: "45 min" },
    { id: 2, title: "Team standup", pillar: "Career", time: "9:30 AM", duration: "15 min" },
    { id: 3, title: "Lunch with Sarah", pillar: "Social", time: "12:30 PM", duration: "1 hr" },
    { id: 4, title: "Read book", pillar: "Mind", time: "2:00 PM", duration: "30 min" },
    { id: 5, title: "Evening prayer", pillar: "Din", time: "8:00 PM", duration: "20 min" },
  ],
  6: [
    { id: 6, title: "Yoga session", pillar: "Health", time: "6:30 AM", duration: "1 hr" },
    { id: 7, title: "Project review", pillar: "Career", time: "10:00 AM", duration: "45 min" },
    { id: 8, title: "Meditation", pillar: "Mind", time: "3:00 PM", duration: "20 min" },
  ],
  7: [
    { id: 9, title: "Family dinner", pillar: "Social", time: "7:00 PM", duration: "2 hrs" },
    { id: 10, title: "Study session", pillar: "Mind", time: "9:00 AM", duration: "2 hrs" },
  ],
  10: [
    { id: 11, title: "Gym workout", pillar: "Health", time: "6:00 AM", duration: "1 hr" },
    { id: 12, title: "Client meeting", pillar: "Career", time: "2:00 PM", duration: "1 hr" },
    { id: 13, title: "Coffee with friends", pillar: "Social", time: "4:30 PM", duration: "1 hr" },
    { id: 14, title: "Evening reflection", pillar: "Din", time: "9:00 PM", duration: "15 min" },
  ],
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(5)
  const [currentMonth, setCurrentMonth] = useState(0) // 0 = January

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))
  }

  const todayEvents = eventsByDay[selectedDay] || []

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Calendar" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {months[currentMonth]} {2025}
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
        <CalendarGrid selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        {/* Today's Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {selectedDay === 5 ? "Today's" : `Day ${selectedDay}'s`} Schedule
            </h3>
            <Badge variant="secondary">{todayEvents.length} events</Badge>
          </div>

          {todayEvents.length > 0 ? (
            todayEvents.map((event) => {
              const pillar = pillars.find((p) => p.name === event.pillar)

              return (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-full rounded-full ${pillar?.color} min-h-[60px]`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{event.time}</span>
                        <span className="text-xs text-muted-foreground">• {event.duration}</span>
                      </div>
                      <p className="font-medium mb-1">{event.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {event.pillar}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No events scheduled for this day</p>
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
