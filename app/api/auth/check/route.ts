import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, isApproved: true }
    })

    return NextResponse.json({ exists: !!user, isApproved: !!user?.isApproved })
  } catch (e) {
    console.error('Error checking user approval:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


