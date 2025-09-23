import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Approve the user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id
      },
      select: {
        id: true,
        email: true,
        isApproved: true,
        approvedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
