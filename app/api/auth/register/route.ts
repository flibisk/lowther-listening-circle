import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, address, location, application } = await request.json()

    // Validate required fields (address optional)
    if (!email || !fullName || !location) {
      return NextResponse.json(
        { error: "Please provide your full name, email, and location" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create new user (not approved yet)
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        fullName,
        address: address || undefined,
        location,
        application: application || undefined,
        role: "MEMBER",
        tier: "ADVOCATE",
        isApproved: false, // Requires admin approval
      }
    })

    return NextResponse.json({
      message: "User created successfully. Awaiting admin approval.",
      userId: user.id
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
