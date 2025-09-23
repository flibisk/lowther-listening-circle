import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp, sha256 } from '@/lib/attribution'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  try {
    // Find the user with this referral code
    const user = await prisma.user.findUnique({
      where: { refCode: code }
    })

    if (!user) {
      // If referral code doesn't exist, redirect without tracking
      return NextResponse.redirect('https://shop.lowtherloudspeakers.com', { status: 302 })
    }

    // Get client information for tracking
    const userAgent = request.headers.get('user-agent') || ''
    const ip = getClientIp(request)
    const ipHash = sha256(ip)

    // Record the click
    await prisma.click.create({
      data: {
        userId: user.id,
        url: 'https://shop.lowtherloudspeakers.com',
        ipHash,
        userAgent
      }
    })

    // Redirect to shop with affiliate tracking
    const res = NextResponse.redirect('https://shop.lowtherloudspeakers.com', { status: 302 })
    res.cookies.set('aff_id', code, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
    
    return res
  } catch (error) {
    console.error('Error tracking referral click:', error)
    // Still redirect even if tracking fails
    return NextResponse.redirect('https://shop.lowtherloudspeakers.com', { status: 302 })
  }
}

