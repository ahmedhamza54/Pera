import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  pillar: { type: String, enum: ['Health', 'Social', 'Mind', 'Career', 'Din'], required: true },
  duration: { type: String, required: true },
  startDate: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const diagnosticSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  objectif: { type: String, required: true },
  problem: { type: String, required: true },
  motivation: { type: String, required: true },
  tasks: [taskSchema],
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
diagnosticSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Diagnostic = mongoose.models.Diagnostic || mongoose.model('Diagnostic', diagnosticSchema);