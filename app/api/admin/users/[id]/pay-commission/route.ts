import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get user's pending commissions
    const pendingCommissions = await prisma.commissionLedger.findMany({
      where: {
        userId: id,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'asc' }
    })

    if (pendingCommissions.length === 0) {
      return NextResponse.json({ error: "No pending commissions found" }, { status: 400 })
    }

    const totalPending = pendingCommissions.reduce((sum, commission) => sum + Number(commission.amount), 0)

    if (amount > totalPending) {
      return NextResponse.json({ error: "Payment amount exceeds pending commissions" }, { status: 400 })
    }

    // Process payment by updating commission statuses
    let remainingAmount = amount
    const updatedCommissions = []

    for (const commission of pendingCommissions) {
      if (remainingAmount <= 0) break

      const commissionAmount = Number(commission.amount)
      
      if (remainingAmount >= commissionAmount) {
        // Mark entire commission as paid
        await prisma.commissionLedger.update({
          where: { id: commission.id },
          data: { 
            status: 'PAID'
          }
        })
        remainingAmount -= commissionAmount
        updatedCommissions.push({ id: commission.id, amount: commissionAmount, status: 'PAID' })
      } else {
        // Partial payment - create new paid commission and update existing
        await prisma.commissionLedger.update({
          where: { id: commission.id },
          data: { 
            amount: commissionAmount - remainingAmount
          }
        })

        await prisma.commissionLedger.create({
          data: {
            userId: commission.userId,
            orderId: commission.orderId,
            amount: remainingAmount,
            currency: commission.currency,
            status: 'PAID',
            reason: commission.reason
          }
        })

        updatedCommissions.push({ 
          id: commission.id, 
          amount: remainingAmount, 
          status: 'PAID',
          originalAmount: commissionAmount,
          remainingAmount: commissionAmount - remainingAmount
        })
        remainingAmount = 0
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment of £${amount.toFixed(2)} processed successfully`,
      updatedCommissions
    })
  } catch (error) {
    console.error("Error processing commission payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
