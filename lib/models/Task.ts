import mongoose from 'mongoose'
import { generateId } from '@/lib/id'

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => generateId() },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // `completed` is a string mirror of `status` for backward compatibility with UI text
  completed: { type: String, enum: ['not started', 'in progress', 'finished'], default: 'not started' },
  // status is the canonical machine-friendly value
  status: { type: String, enum: ['not started', 'in progress', 'finished'], default: 'not started' },
  pillar: { type: String, enum: ['Health', 'Social', 'Mind', 'Career', 'Din'], required: true },
  time: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

taskSchema.pre('save', function (next) {
  // @ts-ignore
  this.updatedAt = new Date()
  next()
})

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
