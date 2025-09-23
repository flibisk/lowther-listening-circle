import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, address, location } = await request.json()

    // Validate required fields
    if (!email || !fullName || !address || !location) {
      return NextResponse.json(
        { error: "All fields are required" },
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
        address,
        location,
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
