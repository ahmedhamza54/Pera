import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { Task } from '@/lib/models/Task'
import { auth } from '@/auth'
import mongoose from 'mongoose'

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  try {
    await connectDB()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const awaitedParams = await params
    const { id } = awaitedParams
    const data = await request.json()
    const allowed = ['status', 'title', 'description', 'time', 'pillar']
    const update: any = {}
    for (const k of allowed) {
      if (data[k] !== undefined) update[k] = data[k]
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

  // require a valid MongoDB ObjectId for the task id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const objectId = new mongoose.Types.ObjectId(id)
  const query: any = { userId: session.user.id, _id: objectId }
  const task = await Task.findOneAndUpdate(query, { $set: update }, { new: true }).lean()
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(task)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    await connectDB()
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const awaitedParams = await params
    const { id } = awaitedParams
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    const objectId = new mongoose.Types.ObjectId(id)
    const res = await Task.findOneAndDelete({ userId: session.user.id, _id: objectId })
    if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
