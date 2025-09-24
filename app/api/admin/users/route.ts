import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("Admin users API called")
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))
    
    // Test database connection first
    try {
      await prisma.$connect()
      console.log("Database connected successfully")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    console.log("Session user:", session?.user)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session user role:", session?.user?.role)
    
    // Also try to get session from request headers
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    console.log("Auth header:", authHeader)
    console.log("Cookie header:", cookieHeader)
    
    if (!session?.user?.id) {
      console.log("No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      console.log("User found:", user)

      if (!user || user.role !== "ADMIN") {
        console.log("User not admin or not found")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } catch (userError) {
      console.error("Error finding user:", userError)
      return NextResponse.json({ error: "Error finding user" }, { status: 500 })
    }

    // Get all users with their stats
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          fullName: true,
          address: true,
          location: true,
          application: true,
          refCode: true,
          discountCode: true,
          role: true,
          tier: true,
          isApproved: true,
          approvedAt: true,
          approvedBy: true,
          ambassadorId: true,
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
                   select: {
                     amount: true,
                     status: true
                   }
                 }
        }
      })

      console.log("Raw users from database:", users)
      console.log("Number of raw users:", users.length)

      // Calculate stats for each user
      const usersWithStats = users.map(user => {
        const paidEarnings = user.Ledger
          .filter(ledger => ledger.status === 'PAID')
          .reduce((sum, ledger) => sum + Number(ledger.amount), 0)
        
        const pendingCommission = user.Ledger
          .filter(ledger => ledger.status === 'PENDING')
          .reduce((sum, ledger) => sum + Number(ledger.amount), 0)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          fullName: user.fullName,
          address: user.address,
          location: user.location,
          application: (user as any).application,
          refCode: user.refCode,
          discountCode: user.discountCode,
          role: user.role,
          tier: user.tier,
          isApproved: user.isApproved,
          approvedAt: user.approvedAt?.toISOString(),
          approvedBy: user.approvedBy,
          ambassadorId: user.ambassadorId,
          createdAt: user.createdAt.toISOString(),
          clicks: user.Clicks.length,
          orders: user.Orders.length,
          totalSales: user.Orders.reduce((sum, order) => sum + Number(order.subtotalNet), 0),
          earnings: paidEarnings,
          pendingCommission: pendingCommission
        }
      })

      console.log("Users with stats:", usersWithStats)
      console.log("Number of users returned:", usersWithStats.length)

      return NextResponse.json(usersWithStats)
    } catch (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
