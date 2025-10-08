import { NextResponse } from "next/server"
import connectDB from "@/lib/db/connect"
import Otp from "@/lib/models/Otp"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Find OTP record
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

    // OTP is valid - don't delete it yet, we'll delete after password reset
    return NextResponse.json(
      {
        message: "OTP verified successfully",
        email: email.toLowerCase(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}