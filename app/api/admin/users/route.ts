import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
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
