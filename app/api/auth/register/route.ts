import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, address, location, application, ambassadorCode } = await request.json()

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
    try {
      const resendApiKey = process.env.RESEND_API_KEY
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'
      const adminTo = process.env.ADMIN_NOTIFY_EMAIL || "peter@lowtherloudspeakers.com"
      
      console.log('Admin notification email config:', {
        hasResendKey: !!resendApiKey,
        emailFrom,
        adminTo,
        resendKeyLength: resendApiKey?.length
      })
      
      if (resendApiKey && emailFrom && adminTo) {
        const resend = new Resend(resendApiKey)
        const lines: string[] = []
        lines.push(`<p><strong>Full Name:</strong> ${fullName}</p>`)
        lines.push(`<p><strong>Email:</strong> ${email}</p>`)
        if (location) lines.push(`<p><strong>Location:</strong> ${location}</p>`)
        if (address) lines.push(`<p><strong>Address:</strong> ${address}</p>`)
        if (application) {
          lines.push(`<h3>Application</h3>`)        
          lines.push(`<pre style="background:#f6f8fa;padding:12px;border-radius:8px;white-space:pre-wrap;">${
            typeof application === "string" ? application : JSON.stringify(application, null, 2)
          }</pre>`)
        }
        const origin = request.nextUrl.origin
        const profileUrl = `${origin}/admin/users/${user.id}`
        lines.push(`<p><a href="${profileUrl}">View applicant in admin</a></p>`)

        console.log('Sending admin notification email to:', adminTo)
        const result = await resend.emails.send({
          from: emailFrom,
          to: adminTo,
          subject: "New Listening Circle application",
          html: `
            <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; color:#111;">
              <h2>New application received</h2>
              ${lines.join("\n")}
            </div>
          `
        })
        
        console.log('Admin notification email result:', result)
        
        if ((result as any)?.error) {
          console.error('Resend admin email error:', (result as any).error)
        } else {
          console.log('✅ Admin notification email sent successfully')
        }
      } else {
        console.log('⚠️ Admin notification email not sent - missing config:', {
          resendApiKey: !!resendApiKey,
          emailFrom: !!emailFrom,
          adminTo: !!adminTo
        })
      }
    } catch (e) {
      console.error("Failed to send admin notification email:", e)
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
