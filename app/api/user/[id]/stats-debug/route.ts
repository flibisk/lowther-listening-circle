import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Debug Stats API called for user:', id)
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') // '30d' | 'lifetime' | null
    const now = new Date()
    const dateFrom = range === '30d' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) : null
    
    // Get user stats without authentication for debugging
    const [clicks, orders, earnings, pendingEarnings, totalSalesResult, advocateEarnings] = await Promise.all([
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
      }),
      // Sum advocate sales (optionally filtered by date range) - only for ambassadors
      prisma.order.aggregate({
        where: {
          user: { ambassadorId: id },
          ...(dateFrom ? { paidAt: { gte: dateFrom } } : {})
        },
        _sum: { subtotalNet: true }
      })
    ])

    const totalEarnings = earnings._sum.amount || 0
    const pendingCommission = pendingEarnings._sum.amount || 0
    const totalSales = totalSalesResult._sum.subtotalNet || 0
    const advocateSales = advocateEarnings._sum.subtotalNet || 0
    const advocateCommission = advocateSales * 0.05 // 5% commission from advocate sales

    console.log('Debug Stats for user', id, ':', { 
      clicks, 
      orders, 
      earnings: Number(totalEarnings), 
      pendingCommission: Number(pendingCommission), 
      totalSales: Number(totalSales),
      advocateSales: Number(advocateSales),
      advocateCommission: Number(advocateCommission)
    })

    return NextResponse.json({
      clicks,
      orders,
      earnings: Number(totalEarnings),
      pendingCommission: Number(pendingCommission),
      totalSales: Number(totalSales),
      advocateSales: Number(advocateSales),
      advocateCommission: Number(advocateCommission),
      range: range === '30d' ? '30d' : 'lifetime'
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
