import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { Task } from '@/lib/models/Task'
import { auth } from '@/auth'
import mongoose from 'mongoose'

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  try {
    await connectDB()
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const awaitedParams = await params
    const { id } = awaitedParams
    const data = await request.json()
    const allowed = ['status', 'title', 'description', 'time', 'pillar', 'completed']
    const update: any = {}
    for (const k of allowed) {
      if (data[k] !== undefined) update[k] = data[k]
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

  // support lookup by custom `id` field or MongoDB _id (only include _id when it's a valid ObjectId)
  const orClauses: any[] = [{ id }]
  if (mongoose.Types.ObjectId.isValid(id)) {
    orClauses.push({ _id: new mongoose.Types.ObjectId(id) })
  }
  const query: any = { userId: session.user.email, $or: orClauses }
  const task = await Task.findOneAndUpdate(query, { $set: update }, { new: true }).lean()
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // normalize id for client
    if (!Array.isArray(task) && !task.id && task._id) {
      (task as any).id = String((task as any)._id)
    }
    return NextResponse.json(task)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    await connectDB()
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const awaitedParams = await params
    const { id } = awaitedParams
    const orClauses: any[] = [{ id }]
    if (mongoose.Types.ObjectId.isValid(id)) {
      orClauses.push({ _id: new mongoose.Types.ObjectId(id) })
    }
    const res = await Task.findOneAndDelete({ userId: session.user.email, $or: orClauses })
    if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
