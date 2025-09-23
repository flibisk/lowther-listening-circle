import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user can only access their own data
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user stats
    const [clicks, orders, earnings] = await Promise.all([
      // Count clicks
      prisma.click.count({
        where: { userId: params.id }
      }),
      // Count orders
      prisma.order.count({
        where: { userId: params.id }
      }),
      // Sum earnings from commission ledger
      prisma.commissionLedger.aggregate({
        where: { 
          userId: params.id,
          status: { in: ['APPROVED', 'PAID'] }
        },
        _sum: { amount: true }
      })
    ])

    const totalEarnings = earnings._sum.amount || 0

    return NextResponse.json({
      clicks,
      orders,
      earnings: Number(totalEarnings)
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
