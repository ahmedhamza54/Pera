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

    const rawTasks = await Task.find({ userId: session.user.id }).sort({ createdAt: 1 }).lean()
    // normalize legacy `completed` boolean/string to `status` string for client
    const tasks = rawTasks.map((t: any) => {
      const normalized = { ...t }
      if (normalized.status === undefined) {
        if (typeof normalized.completed === 'string') {
          normalized.status = normalized.completed
        } else if (typeof normalized.completed === 'boolean') {
          normalized.status = normalized.completed ? 'finished' : 'not started'
        }
      }
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  const data = await request.json()
  const { title, description = '', pillar, time = '', status } = data

    if (!title || !pillar) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const task = new Task({
      userId: session.user.id,
      title,
      description,
      pillar,
      time,
      status: typeof status === 'string' ? status : 'not started',
    })

    await task.save()

    // normalize returned object so client always has `id` and `status`
    const saved = (task as any).toObject ? (task as any).toObject() : task
    return NextResponse.json(saved)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
