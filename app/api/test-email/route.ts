import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || "peter@lowtherloudspeakers.com"
    
    console.log('Email test config:', {
      hasResendKey: !!resendApiKey,
      emailFrom,
      adminTo,
      resendKeyLength: resendApiKey?.length,
      resendKeyPrefix: resendApiKey?.substring(0, 10) + '...'
    })
    
    if (!resendApiKey) {
      return NextResponse.json({ error: "No Resend API key configured" }, { status: 400 })
    }
    
    const resend = new Resend(resendApiKey)
    
    const result = await resend.emails.send({
      from: emailFrom,
      to: adminTo,
      subject: "Test Email - Lowther Listening Circle",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; color:#111;">
          <h2>Test Email</h2>
          <p>This is a test email to verify that admin notifications are working.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      `
    })
    
    console.log('Test email result:', result)
    
    return NextResponse.json({ 
      message: "Test email sent", 
      result,
      config: {
        emailFrom,
        adminTo,
        hasResendKey: !!resendApiKey
      }
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: "Failed to send test email", details: error }, { status: 500 })
  }
}
