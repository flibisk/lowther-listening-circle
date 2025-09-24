import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
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

    // Update user tier to AMBASSADOR
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { tier: "AMBASSADOR" },
      select: {
        id: true,
        email: true,
        tier: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error promoting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
