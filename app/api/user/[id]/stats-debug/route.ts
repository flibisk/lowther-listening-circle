import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Debug Stats API called for user:', params.id)
    
    // Get user stats without authentication for debugging
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

    console.log('Debug Stats for user', params.id, ':', { clicks, orders, earnings: Number(totalEarnings) })

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
