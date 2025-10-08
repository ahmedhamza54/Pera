import { NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
import Otp from "@/lib/models/Otp"
import { sendOtpEmail } from "@/lib/services/email"

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
    }

    // Check if user signed up with Google
    if (user.provider === "google") {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please use 'Continue with Google' to access your account." },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() })

    // Save new OTP
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
    })

    // Send OTP email
    const emailResult = await sendOtpEmail({
      to: email,
      otp,
      userName: user.name,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send OTP email. Please try again." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "OTP sent successfully to your email",
        email: email.toLowerCase(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}