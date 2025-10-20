"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { requestNotificationPermission } from "@/lib/notifications"
import { generateId } from '@/lib/id'
import { Checkbox } from "@/components/ui/checkbox"

const pillars = [
  { name: "Health", color: "bg-chart-1" },
  { name: "Social", color: "bg-chart-2" },
  { name: "Mind", color: "bg-chart-3" },
  { name: "Career", color: "bg-chart-4" },
  { name: "Din", color: "bg-chart-5" },
]

const initialTasks = [
  { id: generateId(), title: "Morning workout", pillar: "Health", time: "7:00 AM", completed: false },
  { id: generateId(), title: "Team standup meeting", pillar: "Career", time: "9:30 AM", completed: false },
  { id: generateId(), title: "Read 30 pages", pillar: "Mind", time: "2:00 PM", completed: false },
  { id: generateId(), title: "Call mom", pillar: "Social", time: "6:00 PM", completed: false },
  { id: generateId(), title: "Evening prayer", pillar: "Din", time: "8:00 PM", completed: false },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth")
    }
      requestNotificationPermission();

  }, [status, router])

  const [tasks, setTasks] = useState(initialTasks)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPillar, setNewTaskPillar] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")

  useEffect(() => {
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleAddTask = () => {
    if (newTaskTitle && newTaskPillar && newTaskTime) {
      const newTask = {
        id: generateId(),
        title: newTaskTitle,
        pillar: newTaskPillar,
        time: newTaskTime,
        completed: false,
      }
      setTasks([...tasks, newTask])
      setIsAddTaskOpen(false)
      setNewTaskTitle("")
      setNewTaskPillar("")
      setNewTaskTime("")
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length

  // Optionally, show a loading state while checking session
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="Pera" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Daily Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <h2 className="text-2xl font-semibold">
                {completedCount} of {tasks.length} completed
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-semibold">12 days</p>
            </div>
          </div>

          <div className="flex gap-2">
            {pillars.map((pillar) => (
              <div key={pillar.name} className={`h-2 flex-1 rounded-full ${pillar.color}`} />
            ))}
          </div>
        </Card>

        <Button className="w-full" size="lg" onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task or Note
        </Button>

        {/* Today's Tasks */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Today's Tasks</h3>

          {tasks.map((task) => {
            const pillar = pillars.find((p) => p.name === task.pillar)

            return (
              <Card key={task.id} className={`p-4 transition-opacity ${task.completed ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-1 h-full rounded-full ${pillar?.color} min-h-[60px]`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {task.pillar}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </div>
                    <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                  </div>
                                  <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(task.id)}
                                    className="mt-1"
                                  />
                </div>
              </Card>
            )
          })}
        </div>
      </main>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Name</Label>
              <Input
                id="task-title"
                placeholder="Enter task name"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-pillar">Pillar Type</Label>
              <Select value={newTaskPillar} onValueChange={setNewTaskPillar}>
                <SelectTrigger id="task-pillar">
                  <SelectValue placeholder="Select a pillar" />
                </SelectTrigger>
                <SelectContent>
                  {pillars.map((pillar) => (
                    <SelectItem key={pillar.name} value={pillar.name}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${pillar.color}`} />
                        {pillar.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-time">Time</Label>
              <Input id="task-time" type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}