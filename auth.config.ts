import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedFields = loginSchema.safeParse(credentials)

          if (!validatedFields.success) {
            return null
          }

          const { email, password } = validatedFields.data

          // Connect to database
          await connectDB()

          // Find user
          const user = await User.findOne({ email })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB()
          
          const existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user for Google sign-in
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              emailVerified: new Date(),
            })
          }

          return true
        } catch (error) {
          console.error("Error during Google sign-in:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
  if (user) {
    if (!user.id) {
      throw new Error("User ID is missing in JWT callback")
    }
    token.id = user.id as string
  }

  // Handle session updates
  if (trigger === "update" && session) {
    token = { ...token, ...session }
  }

  return token
},
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string

        // Fetch fresh user data from database
        try {
          await connectDB()
          const user = await User.findById(token.id).select(
            "name email image level points totalTasksCompleted currentStreak longestStreak createdAt"
          )
 .lean();
          if (user) {
            session.user.level = user.level
            session.user.points = user.points
            session.user.totalTasksCompleted = user.totalTasksCompleted
            session.user.currentStreak = user.currentStreak
            session.user.longestStreak = user.longestStreak
            session.user.memberSince = user.createdAt
          }
        } catch (error) {
          console.error("Error fetching user data in session:", error)
        }
      }

      return session
    },
  },
} satisfies NextAuthConfig