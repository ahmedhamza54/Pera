import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { Task } from '@/lib/models/Task'
import { auth } from '@/auth'

// GET /api/tasks - list tasks for current user
export async function GET() {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawTasks = await Task.find({ userId: session.user.email }).sort({ createdAt: 1 }).lean()
    // normalize possible legacy `completed` boolean to `status` string and ensure `id` exists
    const tasks = rawTasks.map((t: any) => {
      const normalized = { ...t }
      if (normalized.status === undefined) {
        if (typeof normalized.completed === 'string') {
          normalized.status = normalized.completed
        } else if (typeof normalized.completed === 'boolean') {
          normalized.status = normalized.completed ? 'finished' : 'not started'
        }
      }
      // ensure an `id` field for client; prefer `id` if present otherwise use _id
      if (!normalized.id && normalized._id) normalized.id = String(normalized._id)
      return normalized
    })
    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/tasks - create a new task for current user
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
  const { title, description = '', pillar, time = '', status } = data

  // compute completed as a string (keep textual values used by UI)
  let completedStr: string = 'not started'
  if (typeof data.completed === 'string' && data.completed) {
    completedStr = data.completed
  } else if (typeof status === 'string' && status) {
    completedStr = status
  } else if (typeof data.completed === 'boolean') {
    // legacy boolean -> map to string
    completedStr = data.completed ? 'finished' : 'not started'
  }

    if (!title || !pillar) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const task = new Task({
      userId: session.user.email,
      title,
      description,
      pillar,
      time,
      completed: completedStr,
      status: typeof status === 'string' ? status : completedStr,
    })

    await task.save()

    // normalize returned object so client always has `id` and `status`
    const saved = (task as any).toObject ? (task as any).toObject() : task
    if (!saved.id && saved._id) saved.id = String(saved._id)
    // normalize when `completed` is stored as string
    if (saved.status === undefined && typeof saved.completed === 'string') {
      saved.status = saved.completed
    }

    return NextResponse.json(saved)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
