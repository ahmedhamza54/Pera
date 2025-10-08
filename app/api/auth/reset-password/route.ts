import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"
import Otp from "@/lib/models/Otp"

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Verify OTP one more time
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.trim(),
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 })
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id })
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    user.password = hashedPassword
    await user.save()

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id })

    return NextResponse.json(
      {
        message: "Password reset successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}