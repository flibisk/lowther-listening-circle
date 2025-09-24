import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if this is the admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'peter@lowtherloudspeakers.com'
    if (email !== adminEmail) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    // Store the reset token in the database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: resetExpires
      }
    })

    // Generate the reset URL
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`

    // Send reset email
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Admin Password Reset - Lowther Listening Circle",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
              <h1 style="color: #c69963;">Password Reset Request</h1>
              <p>You have requested to reset your admin password for the Lowther Listening Circle.</p>
              <p>Click the link below to reset your password:</p>
              <p style="margin: 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #c69963; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">Reset Password</a>
              </p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p style="margin-top: 24px;">The Lowther Team</p>
            </div>
          `,
        })
        console.log(`✅ Password reset email sent to ${email}`)
      } catch (e) {
        console.error('Failed to send password reset email:', e)
        return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Password reset email sent" })
  } catch (error) {
    console.error("Error processing password reset request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
