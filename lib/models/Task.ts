import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  // userId stores the application's user id (session.user.id)
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
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
