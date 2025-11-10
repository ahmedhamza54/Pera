"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { requestNotificationPermission } from "@/lib/notifications"

const pillars = [
  { name: "Health", color: "bg-chart-1" },
  { name: "Social", color: "bg-chart-2" },
  { name: "Mind", color: "bg-chart-3" },
  { name: "Career", color: "bg-chart-4" },
  { name: "Din", color: "bg-chart-5" },
]

// --- OFFLINE UTILS ---
const LOCAL_TASKS_KEY = 'offline_tasks';

function saveTasksToCache(tasks: any[]) {
  try {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks))
  } catch {}
}

function getTasksFromCache() {
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth")
    }
    requestNotificationPermission()
  }, [status, router])

  const [tasks, setTasks] = useState<any[]>([])
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPillar, setNewTaskPillar] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")

  // --- FETCH & CACHE ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : [])
          saveTasksToCache(data) // Save to offline cache
        } else {
          setTasks(getTasksFromCache()) // Fallback on fetch error
        }
      } catch (err) {
        setTasks(getTasksFromCache()) // Fallback on network error
      }
    }
    fetchTasks();
  }, [])

  useEffect(() => {
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  const updateTaskStatus = async (id: string | undefined, status: 'not started' | 'in progress' | 'finished') => {
    try {
      if (!id) return
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setTasks(prev => {
        const next = prev.map((t) => (String(t._id) === id ? updated : t))
        saveTasksToCache(next)
        return next
      })
      setMenuOpenTaskId(null)
    } catch (err) {
      // Optionally inform user
      console.error('Update status failed', err)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskPillar) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          pillar: newTaskPillar,
          time: newTaskTime,
        }),
      })

      if (!res.ok) throw new Error('Failed to create task')
      const created = await res.json()
      setTasks(prev => {
        const next = [...prev, created]
        saveTasksToCache(next)
        return next
      })

      setIsAddTaskOpen(false)
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskPillar("")
      setNewTaskTime("")
    } catch (err) {
      console.error('Create task failed', err)
    }
  }

  const completedCount = tasks.filter((t) => t.status === 'finished').length

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

          {tasks.map((task, idx) => {
            const pillar = pillars.find((p) => p.name === task.pillar)

            return (
              <Card key={String(task._id) ?? `task-${idx}`} className={`p-4 transition-opacity ${task.status === 'finished' ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-1 h-full rounded-full ${pillar?.color} min-h-[60px]`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {task.pillar}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{task.status}</span>
                    </div>
                    <p className={`text-sm ${task.status === 'finished' ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                  </div>
                  <div className="relative">
                    {(() => {
                      const taskId = String(task._id)
                      return (
                        <>
                          <button
                            type="button"
                            aria-label="Task actions"
                            onClick={() => {
                              if (!taskId) return
                              setMenuOpenTaskId(menuOpenTaskId === taskId ? null : taskId)
                            }}
                            className="p-2 rounded-full hover:bg-secondary"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {menuOpenTaskId === taskId && (
                            <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-md shadow-md z-50">
                              <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={() => updateTaskStatus(taskId, 'finished')}>Finish task</button>
                              <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={() => updateTaskStatus(taskId, 'in progress')}>In progress</button>
                              <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={() => updateTaskStatus(taskId, 'not started')}>Not started</button>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
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
              <Label htmlFor="task-description">Description (optional)</Label>
              <Input
                id="task-description"
                placeholder="Add a short description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
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
