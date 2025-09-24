import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    // First delete all related records to avoid foreign key constraints
    await prisma.click.deleteMany({
      where: { userId: id }
    })

    await prisma.order.deleteMany({
      where: { userId: id }
    })

    await prisma.commissionLedger.deleteMany({
      where: { userId: id }
    })

    await prisma.lead.deleteMany({
      where: { referrerUserId: id }
    })

    await prisma.account.deleteMany({
      where: { userId: id }
    })

    await prisma.session.deleteMany({
      where: { userId: id }
    })

    // Now delete the user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
