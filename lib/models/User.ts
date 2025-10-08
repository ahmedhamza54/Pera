import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IUser extends Document {
     _id: Types.ObjectId
  name: string
  email: string
  password?: string
  image?: string // <-- FIXED: just a string, not an object
  provider?: "credentials" | "google"
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
  level: number
  points: number
  totalTasksCompleted: number
  currentStreak: number
  longestStreak: number
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
    },
    image: {
      type: String,
      default: "/default-avatar.png", // <-- Add this here
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User