import { NextResponse } from 'next/server'
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const res = NextResponse.redirect('https://shop.lowtherloudspeakers.com', { status: 302 })
  res.cookies.set('aff_id', code, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  return res
}

