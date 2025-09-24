import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Stats API called for user:', id)
    
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user can only access their own data
    if (session.user.id !== id) {
      console.log('User ID mismatch:', session.user.id, 'vs', id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user stats
    const [clicks, orders, earnings] = await Promise.all([
      // Count clicks
      prisma.click.count({
        where: { userId: id }
      }),
      // Count orders
      prisma.order.count({
        where: { userId: id }
      }),
      // Sum earnings from commission ledger
      prisma.commissionLedger.aggregate({
        where: { 
          userId: id,
          status: { in: ['APPROVED', 'PAID'] }
        },
        _sum: { amount: true }
      })
    ])

    const totalEarnings = earnings._sum.amount || 0

    console.log('Stats for user', id, ':', { clicks, orders, earnings: Number(totalEarnings) })

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
