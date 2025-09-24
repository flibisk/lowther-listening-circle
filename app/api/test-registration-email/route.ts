import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  console.log('🧪 Test registration email API called')
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || "peter@lowtherloudspeakers.com"
    
    console.log('📧 Email config:', {
      hasResendKey: !!resendApiKey,
      emailFrom,
      adminTo,
      resendKeyLength: resendApiKey?.length,
      resendKeyPrefix: resendApiKey?.substring(0, 10) + '...'
    })
    
    if (!resendApiKey || !emailFrom || !adminTo) {
      console.log('❌ Missing email configuration')
      return NextResponse.json({ error: "Missing email configuration" }, { status: 400 })
    }
    
    const resend = new Resend(resendApiKey)
    const lines: string[] = []
    lines.push(`<p><strong>Full Name:</strong> Test User</p>`)
    lines.push(`<p><strong>Email:</strong> test@example.com</p>`)
    lines.push(`<p><strong>Location:</strong> London</p>`)
    lines.push(`<h3>Application</h3>`)
    lines.push(`<pre style="background:#f6f8fa;padding:12px;border-radius:8px;white-space:pre-wrap;">Test application data</pre>`)
    lines.push(`<p><a href="http://localhost:3000/admin/users/test-id">View applicant in admin</a></p>`)

    console.log('📤 Sending admin notification email to:', adminTo)
    
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
    
    console.log('✅ Admin notification email result:', result)
    
    if ((result as any)?.error) {
      console.error('❌ Resend admin email error:', (result as any).error)
      return NextResponse.json({ error: "Email failed", details: (result as any).error }, { status: 500 })
    } else {
      console.log('✅ Admin notification email sent successfully')
      return NextResponse.json({ 
        message: "Admin notification email sent successfully", 
        result,
        config: { emailFrom, adminTo }
      })
    }
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error)
    return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 })
  }
}
