import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { promises as fs } from "fs"
import path from "path"
import connectDB from "@/lib/db/connect"
import User from "@/lib/models/User"

const secret = process.env.NEXTAUTH_SECRET

// PATCH - Upload profile image
export async function PATCH(req: Request) {
  try {
    const token = await getToken({ req, secret })
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    await connectDB()

    // Save image to /public/uploads
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}_${file.name}`
    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    const imageUrl = `/uploads/${filename}`

    // Update user
    await User.findOneAndUpdate(
      { email: token.email },
      { image: imageUrl },
      { new: true }
    )

    return NextResponse.json({ message: "Profile image updated", image: imageUrl })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE - Account deletion
export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret })
    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    await User.findOneAndDelete({ email: token.email })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
