import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  console.log('🚀 Registration API called')
  try {
    const { email, fullName, address, location, application, ambassadorCode } = await request.json()
    console.log('📝 Registration data received:', { email, fullName, location })

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

    // Find ambassador if ambassadorCode is provided
    let ambassadorId = null
    if (ambassadorCode) {
      const ambassador = await prisma.user.findUnique({
        where: { refCode: ambassadorCode }
      })
      if (ambassador && ambassador.tier === "AMBASSADOR") {
        ambassadorId = ambassador.id
        console.log('Found ambassador:', ambassador.email, 'ID:', ambassador.id)
      } else {
        console.log('Ambassador not found or not an ambassador:', ambassadorCode)
      }
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
        ambassadorId: ambassadorId || undefined,
      }
    })

    // Notify admin of new application (if email configured)
    console.log('📧 About to send admin notification email')
    
    // Simple email test - just send a basic email
    try {
      const resendApiKey = process.env.RESEND_API_KEY
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'
      const adminTo = process.env.ADMIN_NOTIFY_EMAIL || "peter@lowtherloudspeakers.com"
      
      console.log('📧 Email config:', {
        hasResendKey: !!resendApiKey,
        emailFrom,
        adminTo
      })
      
      if (resendApiKey && emailFrom && adminTo) {
        const resend = new Resend(resendApiKey)
        
        console.log('📤 Sending admin notification email to:', adminTo)
        
        const result = await resend.emails.send({
          from: emailFrom,
          to: adminTo,
          subject: "New Listening Circle application",
          html: `
            <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; color:#111;">
              <h2>New application received</h2>
              <p><strong>Full Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><a href="${request.nextUrl.origin}/admin/users/${user.id}">View applicant in admin</a></p>
            </div>
          `
        })
        
        console.log('✅ Admin notification email result:', result)
        
        if ((result as any)?.error) {
          console.error('❌ Resend admin email error:', (result as any).error)
        } else {
          console.log('✅ Admin notification email sent successfully')
        }
      } else {
        console.log('⚠️ Admin notification email not sent - missing config')
      }
    } catch (e) {
      console.error("❌ Failed to send admin notification email:", e)
    }

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
