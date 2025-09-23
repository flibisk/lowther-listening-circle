import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user can only access their own data
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user's advocates
    const advocates = await prisma.user.findMany({
      where: { 
        ambassadorId: id,
        isApproved: true // Only show approved advocates
      },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        refCode: true,
        createdAt: true,
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

    // Calculate stats for each advocate
    const advocatesWithStats = advocates.map(advocate => ({
      id: advocate.id,
      email: advocate.email,
      name: advocate.name,
      fullName: advocate.fullName,
      refCode: advocate.refCode,
      createdAt: advocate.createdAt.toISOString(),
      totalSales: advocate.Orders.reduce((sum, order) => sum + Number(order.subtotalNet), 0),
      earnings: advocate.Ledger.reduce((sum, ledger) => sum + Number(ledger.amount), 0)
    }))

    return NextResponse.json(advocatesWithStats)
  } catch (error) {
    console.error("Error fetching advocates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
