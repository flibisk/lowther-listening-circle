import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Approve the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id
      },
      select: {
        id: true,
        email: true,
        isApproved: true,
        approvedAt: true
      }
    })

    // Generate a one-time NextAuth magic link by inserting a VerificationToken
    // Prefer the request origin to avoid mismatched domain during local/dev usage
    const requestOrigin = request.headers.get('origin') || undefined
    const baseUrl = requestOrigin || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    let magicUrl = `${baseUrl}/login`
    try {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
      await prisma.verificationToken.create({
        data: {
          identifier: updatedUser.email,
          token,
          expires
        }
      })
      const callbackUrl = encodeURIComponent(`${baseUrl}/dashboard`)
      magicUrl = `${baseUrl}/api/auth/callback/email?callbackUrl=${callbackUrl}&token=${token}&email=${encodeURIComponent(updatedUser.email)}`
    } catch (e) {
      console.error('Failed to create magic link token, falling back to /login:', e)
    }

    // Send acceptance email via Resend
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: updatedUser.email,
          subject: "You’ve been accepted into the Listening Circle",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
            <h1 style="margin: 0 0 16px 0; font-size: 28px;">Welcome to the Listening Circle</h1>
            <p style="line-height: 1.6;">We are pleased to let you know that your application has been accepted.</p>
            <p style="line-height: 1.6;">The Listening Circle is a private space for those who share our passion for music and craftsmanship. Here, you’ll be able to:</p>
            <ul style="line-height: 1.6;">
              <li>Share Lowther with others through your personal link</li>
              <li>Track the interest you inspire and enjoy exclusive Circle rewards</li>
              <li>Access a curated knowledge base and future insights from our archives</li>
            </ul>
            <p style="line-height: 1.6;">To begin, simply use the secure sign-in link below.</p>
            <p style="margin: 24px 0;">
              <a href="${magicUrl}" style="display: inline-block; background: #c69963; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">Sign in to the Listening Circle</a>
            </p>
            <p style="line-height: 1.6;">This link is unique to you and will allow you to access the platform immediately.</p>
            <p style="line-height: 1.6;">We look forward to welcoming you inside.</p>
            <p style="margin-top: 24px;">The Lowther Team</p>
          </div>
          `,
        })
      } catch (e) {
        console.error('Failed to send acceptance email:', e)
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
