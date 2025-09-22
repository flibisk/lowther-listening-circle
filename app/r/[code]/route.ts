import { NextResponse } from 'next/server'
export async function GET(_: Request, { params }: { params: { code: string } }) {
  const res = NextResponse.redirect('https://shop.lowtherloudspeakers.com', { status: 302 })
  res.cookies.set('aff_id', params.code, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  return res
}
