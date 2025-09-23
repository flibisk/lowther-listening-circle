import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Debug Stats API called for user:', id)
    
    // Get user stats without authentication for debugging
    const [clicks, orders, earnings, pendingEarnings, totalSalesResult] = await Promise.all([
      // Count clicks
      prisma.click.count({
        where: { userId: id }
      }),
      // Count orders
      prisma.order.count({
        where: { userId: id }
      }),
      // Sum earnings from commission ledger (paid)
      prisma.commissionLedger.aggregate({
        where: { 
          userId: id,
          status: 'PAID'
        },
        _sum: { amount: true }
      }),
      // Sum pending earnings from commission ledger
      prisma.commissionLedger.aggregate({
        where: { 
          userId: id,
          status: 'PENDING'
        },
        _sum: { amount: true }
      }),
      // Sum total sales
      prisma.order.aggregate({
        where: { userId: id },
        _sum: { subtotalNet: true }
      })
    ])

    const totalEarnings = earnings._sum.amount || 0
    const pendingCommission = pendingEarnings._sum.amount || 0
    const totalSales = totalSalesResult._sum.subtotalNet || 0

    console.log('Debug Stats for user', id, ':', { clicks, orders, earnings: Number(totalEarnings), pendingCommission: Number(pendingCommission), totalSales: Number(totalSales) })

    return NextResponse.json({
      clicks,
      orders,
      earnings: Number(totalEarnings),
      pendingCommission: Number(pendingCommission),
      totalSales: Number(totalSales)
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
