import mongoose, { Schema, Document, Model } from "mongoose"

export interface IOtp extends Document {
  email: string
  otp: string
  createdAt: Date
  expiresAt: Date
}

const OtpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - automatically delete expired documents
  },
})

// Prevent model recompilation in development
const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema)

export default Otp