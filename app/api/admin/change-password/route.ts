import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 })
    }

    // Verify current password
    const adminEmail = process.env.ADMIN_EMAIL || 'peter@lowtherloudspeakers.com'
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    
    if (!adminPasswordHash) {
      return NextResponse.json({ error: "Admin password hash not configured" }, { status: 500 })
    }

    const isValidCurrentPassword = await bcrypt.compare(currentPassword, adminPasswordHash)
    
    if (!isValidCurrentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Generate new password hash
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update the environment variable (this will require a restart)
    // For now, we'll return the new hash so it can be updated manually
    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully. Please update ADMIN_PASSWORD_HASH environment variable with the new hash below:",
      newPasswordHash: newPasswordHash
    })

  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
