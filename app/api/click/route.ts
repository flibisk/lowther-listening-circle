import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sha256, getClientIp } from '@/lib/attribution'

export async function POST(req: Request) {
  const { ref, url } = await req.json().catch(()=>({}))
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })
  const ip = getClientIp(req)
  const ipHash = ip ? sha256(ip) : 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'
  const user = await prisma.user.findUnique({ where: { refCode: ref } })
  if (!user) return NextResponse.json({ error: 'Unknown ref' }, { status: 404 })
  await prisma.click.create({ data: { userId: user.id, url: url || '/', ipHash, userAgent: ua } })
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', `aff_id=${ref}; Path=/; HttpOnly; SameSite=Lax; Secure`)
  return res
}
