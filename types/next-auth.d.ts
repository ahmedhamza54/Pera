import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: any
      level?: number
      points?: number
      totalTasksCompleted?: number
      currentStreak?: number
      longestStreak?: number
      memberSince?: Date
    } & DefaultSession["user"]
  }

  interface User {
    level?: number
    points?: number
    totalTasksCompleted?: number
    currentStreak?: number
    longestStreak?: number
    memberSince?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}