import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("Admin users API called")
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    console.log("Session user:", session?.user)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session user role:", session?.user?.role)
    
    if (!session?.user?.id) {
      console.log("No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    console.log("User found:", user)

    if (!user || user.role !== "ADMIN") {
      console.log("User not admin or not found")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all users with their stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        refCode: true,
        discountCode: true,
        role: true,
        tier: true,
        createdAt: true,
        Clicks: {
          select: {
            id: true
          }
        },
        Orders: {
          select: {
            subtotalNet: true
          }
        },
        Ledger: {
          where: {
            status: { in: ['APPROVED', 'PAID'] }
          },
          select: {
            amount: true
          }
        }
      }
    })

    // Calculate stats for each user
    const usersWithStats = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      refCode: user.refCode,
      discountCode: user.discountCode,
      role: user.role,
      tier: user.tier,
      createdAt: user.createdAt.toISOString(),
      clicks: user.Clicks.length,
      orders: user.Orders.length,
      totalSales: user.Orders.reduce((sum, order) => sum + Number(order.subtotalNet), 0),
      earnings: user.Ledger.reduce((sum, ledger) => sum + Number(ledger.amount), 0)
    }))

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
